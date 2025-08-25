import { compareSync, hashSync } from "bcrypt";
import User from "../../../DB/Models/user.model.js";
import BlackListedTokens from "../../../DB/Models/black-listed-tokens.model.js";
import { assymetricDecryption, assymetricEncryption, encrypt, decrypt } from "../../../Utils/encryption.utils.js";
import { customAlphabet } from "nanoid";
import { emitter } from "../../../Utils/send-email.utils.js"
import { v4 as uuidv4 } from "uuid"
import { generateToken, verifyToken } from "../../../Utils/tokens.utils.js";


const uniqueString = customAlphabet('1234567890abcdef', 5)


export const signUpService = async (req, res) => {

    const { firstname, lastname, email, password, age, gender, phoneNumber } = req.body

    const isUserExist = await User.findOne({
        $or: [
            { email },
            { firstname, lastname }
        ]
    })

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

    //Send email for registred user
    // await sendEmail({
    //     to: email,
    //     subject: "Confirmation email",
    //     content: ` Your confirmation otp is ${otp} `,
    //     attachments: [
    //         {
    //             filename: "confirmation.png",
    //             path: "confirmation.png"
    //         }
    //     ]
    // })

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

    // const userInstance = new User({ firstname, lastname, email, password, age, gender })
    // const user = await userInstance.save()
    return res.status(201).json({ message: "User created successfully", user })
}


export const confirmEmailService = async (req, res, next) => {

    const { email, otp } = req.body
    const user = await User.findOne({ email, isConfirmed: false })

    if (!user) {
        // return res.status(404).json({ message: "User not found or already confirmed"  });
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
    const user = await User.findOne({ email })

    if (!user) {
        return res.status(404).json({ message: "Invalid email or password" });
    }

    const isPasswordMatch = compareSync(password, user.password)

    if (!isPasswordMatch) {
        return res.status(404).json({ message: "Invalid email or password" });
    }

    // Generate token for logged in user
    const accesstoken = generateToken(
        { _id: user._id, email: user.email },
        process.env.JWT_ACCESS_SECRET,
        {
            // issuer: 'https://localhost:3000',
            // audience: 'https://localhost:4000',
            //expiresIn: parseInt(process.env.JWT_ACCESS_EXPIRES_IN),
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
            jwtid: uuidv4()
        }
    )
    const refreshtoken = generateToken(
        { _id: user._id, email: user.email },
        process.env.JWT_REFRESH_SECRET,
        {

            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
            jwtid: uuidv4()
        }
    )
    return res.status(200).json({ message: "User signed in successfully", accesstoken, refreshToken })
}


export const updateAccountService = async (req, res) => {

    const { _id } = req.loggedInUser.user;

    const { firstname, lastname, email, age, gender } = req.body
    console.log(req.loggedInUser);

    const user = await User.findByIdAndUpdate(
        _id,
        { firstname, lastname, email, age, gender },
        { new: true }
    )
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    // await user.save()
    return res.status(200).json({ message: "User updated successfully" })
}


export const deleteAccountService = async (req, res) => {

    const { userId } = req.params
    const deletedResult = await User.deleteOne({ _id: userId })

    if (!deletedResult.deletedCount) {
        return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User deleted successfully" })
}


export const listUsersService = async (req, res) => {

    let users = await User.find().populate("Messages")

    // users = users.map((user) => {
    //     return {
    //         ...user._doc,
    //         phoneNumber: assymetricDecryption(user.phoneNumber)
    //     }
    // })
    return res.status(200).json({ message: "Users fetched successfully", users })
}


export const LogoutService = async (req, res) => {

    const { token: { tokenId, expirationDate }, user: { _Id } } = req.loggedInUser

    await BlackListedTokens.create({
        tokenId,
        expirationDate: new Date(expirationDate * 1000),
        userId: _Id
    })

    return res.status(200).json({ message: "User logged out successfully" })
}



export const RefreshTokenService = async (req, res) => {

    const { refreshtoken } = req.headers
    const decodedData = verifyToken(refreshtoken, process.env.JWT_REFRESH_SECRET)
    if (!decodedData) {
        return res.status(400).json({ message: "Invalid refresh token" });
    }

    const accesstoken = generateToken(
        { _id: decodedData._id, email: decodedData.email },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
            jwtid: uuidv4()
        }
    )
    return res.status(200).json({ message: "Token refreshed successfully", accesstoken })

}