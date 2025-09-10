import { compareSync, hashSync } from "bcrypt";
import User from "../../../DB/Models/user.model.js";
import BlackListedTokens from "../../../DB/Models/black-listed-tokens.model.js";
import { assymetricDecryption, assymetricEncryption, encrypt, decrypt } from "../../../Utils/encryption.utils.js";
import { customAlphabet } from "nanoid";
import { emitter } from "../../../Utils/send-email.utils.js"
import { v4 as uuidv4 } from "uuid"
import { generateToken, verifyToken } from "../../../Utils/tokens.utils.js";
import mongoose from "mongoose";
import Messages from "../../../DB/Models/messages.model.js";
import { OAuth2Client } from "google-auth-library"
import { providerEnum } from "../../../Common/enums/user.enum.js";

const uniqueString = customAlphabet('1234567890abcdef', 5)


export const signUpService = async (req, res) => {

    const { firstname, lastname, email, password, age, gender, phoneNumber } = req.body

    const isUserExist = await User.findOne({ email, provider: providerEnum.LOCAL })

    if (isUserExist) {
        return res.status(409).json({ message: "User already exists" });
    }

    //Encrypt phone number
    const encryptedPhoneNumber = assymetricEncryption(phoneNumber)

    //Hash password
    const hashedPassword = hashSync(password, +process.env.SALT_ROUNDS)

    const otp = uniqueString()

    const user = await User.create({
        firstname,
        lastname,
        email,
        password: hashedPassword,
        age,
        gender,
        phoneNumber: encryptedPhoneNumber,
        otps: { confirmation: hashSync(otp, +process.env.SALT_ROUNDS) }
    })

    emitter.emit('sendEmail', {
        to: email,
        subject: "Confirmation email",
        content: ` Your confirmation otp is ${otp} `,
        attachments: [
            {
                filename: "confirmation.png",
                path: "confirmation.png"
            }
        ]
    })
    return res.status(201).json({ message: "User created successfully", user })
}



export const confirmEmailService = async (req, res, next) => {

    const { email, otp } = req.body
    const user = await User.findOne({ email, isConfirmed: false })

    if (!user) {
        return next(new Error("User not found or already confirmed", { cause: 400 }))
    }

    const isOtpMatch = compareSync(otp, user.otps?.confirmation)
    if (!isOtpMatch) {
        return res.status(404).json({ message: "Invalid otp" });
    }

    user.isConfirmed = true
    user.otps.confirmation = undefined

    await user.save()
    return res.status(200).json({ message: "Email confirmed successfully", user })
}


export const signinService = async (req, res) => {

    const { email, password } = req.body
    const user = await User.findOne({ email, provider: providerEnum.LOCAL })

    if (!user) {
        return res.status(404).json({ message: "Invalid email or password" });
    }

    const isPasswordMatch = compareSync(password, user.password)

    if (!isPasswordMatch) {
        return res.status(404).json({ message: "Invalid email or password" });
    }

    const accesstoken = generateToken(
        { _id: user._id, email: user.email },
        process.env.JWT_ACCESS_SECRET,
        {
            // issuer: 'https://localhost:3000',
            // audience: 'https://localhost:4000',
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
            jwtid: uuidv4()
        }
    )
    const refreshtoken = generateToken(
        { _id: user._id, email: user.email },
        process.env.JWT_REFRESH_SECRET,
        {
            // issuer: 'https://localhost:3000',
            // audience: 'https://localhost:4000',
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
            jwtid: uuidv4()
        }

    )
    return res.status(200).json({ message: "User signed in successfully", accesstoken, refreshtoken })
}


export const updateAccountService = async (req, res) => {
    const { _id } = req.loggedInUser.user;
    const { firstname, lastname, email, age, gender, phoneNumber } = req.body;

    const updateData = { firstname, lastname, email, age, gender };

    if (phoneNumber) {
        updateData.phoneNumber = assymetricEncryption(phoneNumber);
    }

    const user = await User.findByIdAndUpdate(
        _id,
        updateData,
        { new: true }
    );

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User updated successfully", user });
}


export const deleteAccountService = async (req, res) => {
    //start session
    const session = await mongoose.startSession()
    req.session = session
    const { _id } = req.loggedInUser.user

    //start transaction
    session.startTransaction()

    const deletedUser = await User.findByIdAndDelete(_id, { session })

    if (!deletedUser) {
        return res.status(404).json({ message: "User not found" })
    }

    await Messages.deleteMany({ receiverId: _id }, { session })

    //commit transaction
    await session.commitTransaction()
    //end session
    session.endSession()

    return res.status(200).json({ message: "User deleted successfully", deletedUser })

}


export const listUsersService = async (req, res) => {

    let users = await User.find().select("-password")

    users = users.map((user) => {
        return {
            ...user._doc,
            phoneNumber: assymetricDecryption(user.phoneNumber)
        }
    })
    return res.status(200).json({ message: "Users fetched successfully", users })
}



export const LogoutService = async (req, res) => {

    const { accesstoken } = req.headers;
    const { token: { tokenId, expirationDate }, user: { _id } } = req.loggedInUser;

    await BlackListedTokens.create({
        token: accesstoken,
        tokenId,
        expirationDate: new Date(expirationDate * 1000),
        userId: _id
    });

    return res.status(200).json({ message: "User logged out successfully" });
};


export const RefreshTokenService = async (req, res) => {
    const { refreshtoken } = req.headers

    const decodedData = verifyToken(refreshtoken, process.env.JWT_REFRESH_SECRET)
    const accesstoken = generateToken(
        { _id: decodedData._id, email: decodedData.email },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
            jwtid: uuidv4()
        }
    )
    return res.status(200).json({ message: "User Token refreshed successfully", accesstoken })

}

export const updatePasswordServices = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const { user } = req.loggedInUser;

    const dbUser = await User.findById(user._id);
    const isPasswordMatch = compareSync(oldPassword, dbUser.password)
    if (!isPasswordMatch) {
        return res.status(404).json({ message: "User not found" });
    }
    dbUser.password = hashSync(newPassword, +process.env.SALT_ROUNDS);
    await dbUser.save();

    return res.status(200).json({ message: "Password updated successfully" });

}

export const authServiceWithGemail = async (req, res) => {

    const { idToken } = req.body
    const client = new OAuth2Client()

    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.WEB_CLIENT_ID,
    });
    const { email, given_name, family_name, email_verified, sub } = ticket.getPayload()

    if (!email_verified) {
        return res.status(404).json({ message: "Email not verified" });
    }

    const isUserExist = await User.findOne({ googleSub: sub, provider: providerEnum.GOOGLE })
    let newUser;

    if (!isUserExist) {
        newUser = new User.create({
            firstname: given_name,
            lastname: family_name || " ",
            email,
            provider: providerEnum.GOOGLE,
            isConfirmed: true,
            password: hashSync(uniqueString(), +process.env.SALT_ROUNDS)
        })
    } else {
        newUser = isUserExist
        isUserExist.email = email
        isUserExist.firstname = given_name
        isUserExist.lastname = family_name
        await isUserExist.save()
    }

    const accesstoken = generateToken(
        { _id: newUser._id, email: newUser.email },
        process.env.JWT_ACCESS_SECRET,
        {
            // issuer: 'https://localhost:3000',
            // audience: 'https://localhost:4000',
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
            jwtid: uuidv4()
        }
    )
    const refreshtoken = generateToken(
        { _id: newUser._id, email: newUser.email },
        process.env.JWT_REFRESH_SECRET,
        {
            // issuer: 'https://localhost:3000',
            // audience: 'https://localhost:4000',
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
            jwtid: uuidv4()
        }
    )

    res.status(200).json({ message: "User signed up successfully", token: { accesstoken, refreshtoken }, user })
}