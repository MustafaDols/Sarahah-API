//user schema
import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
    {
        firstname: {
            type: String,
            required: true,
            minLength: [3, "First name must be at least 3 characters long"],
            maxLength: [20, "First name must be at most 20 characters long"],
            lowercase: true,
            trim: true
        },
        lastname: {
            type: String,
            required: true,
            minLength: [3, "last name must be at least 3 characters long"],
            maxLength: [20, "last name must be at most 20 characters long"],
            lowercase: true,
            trim: true
        },
        age: {
            type: Number,
            required: true,
            minLength: [18, "Age must be at least 18 years old"],
            maxLength: [100, "Age must be at most 100 years old"],
            index: {
                name: "idx_age"
            }//path level
        },
        gender: {
            type: String,
            enum: ["male", "female"],
            default: "male"
        },
        email: {
            type: String,
            required: true,
            index: {
                unique: true,
                name: "idx_email_unique"
            }
        },
        password: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: String,
            required: true
        },
        otps: {

            confirmation:String,
            resetPassword:String
        },
        isConfirmed: {
            type: Boolean,
            default: false
        }
    }, {
    timestamps: true,
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    },
    virtuals: {
        fullname: {
            get() {
                return `${this.firstname} ${this.lastname}`
            }
        }

    },
    methods: {
        sayHi() {
            console.log(`Hi ${this.fullname}`);
        }
    },
    capped: {
        size: 1024,
        max: 100
    },
    collection: "users"
});

//Compound index Schema level
userSchema.index({ firstname: 1, lastname: 1 }, { name: "idx_first_last_name_unique", unique: true });

//create model
const User = mongoose.model("User", userSchema);

export default User;
