import User from "../../../DB/Models/user.model.js";

export const signUpService = async (req, res) => {
    try {

        const { firstname, lastname, email, password, age, gender } = req.body

        const isUserExist = await User.findOne({
            $or: [
                { email },
                { firstname, lastname }
            ]
        })

        if (isUserExist) {
            return res.status(409).json({ message: "User already exists" });
        }


        const user = await User.create({ firstname, lastname, email, password, age, gender })

        // const userInstance = new User({ firstname, lastname, email, password, age, gender })
        // const user = await userInstance.save()

        return res.status(201).json({ message: "User created successfully", user })

    } catch (error) {

        res.status(500).json({ message: "Internal server error", error })
    }

}


export const signinService = async (req, res) => {

    try {

        const { email, password } = req.body

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.password !== password) {
            return res.status(401).json({ message: "Invalid password" });
        }

        return res.status(200).json({ message: "User signed in successfully", user })

    } catch (error) {
        res.status(500).json({ message: "Internal server error", error })
    }
}


export const updateAccountService = async (req, res) => {

    try {

        const { userId } = req.params
        const { firstname, lastname, email, age, gender } = req.body

        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (firstname) user.firstname = firstname
        if (lastname) user.lastname = lastname
        if (email) {
            const isEmailExist = await User.findOne({ email })
            if (isEmailExist) {
                return res.status(409).json({ message: "Email already exists" });
            }
            user.email = email

        }
        if (age) user.age = age
        if (gender) user.gender = gender

        await user.save()
        return res.status(200).json({ message: "User updated successfully", user })

    } catch (error) {

        res.status(500).json({ message: "Internal server error", error })
    }
}


export const deleteAccountService = async (req, res) => {

    try {
        const { userId } = req.params
        const deletedResult = await User.deleteOne({ _id: userId })
         if (!deletedResult.deletedCount) {
            return res.status(404).json({ message: "User not found" });
        }
            
        return res.status(200).json({ message: "User deleted successfully" })

    } catch (error) {
        res.status(500).json({ message: "Internal server error", error })
    }

}