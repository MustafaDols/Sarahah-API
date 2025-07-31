// database connection
import mongoose from "mongoose";

export const dbConnection = async () => {
    try {
        //30s timeout
        await mongoose.connect("mongodb://127.0.0.1:27017/sarahah-App");
        console.log("Database connected successfully");
    } catch (error) {
        console.log(" Database failing to connect", error);
    }
};

export default dbConnection;