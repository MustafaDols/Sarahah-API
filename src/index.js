import 'dotenv/config'
import express from "express";
import userRouter from "./Modules/Users/user.controller.js";
import messageRouter from "./Modules/Messages/message.controller.js";
import dbConnection from "./DB/db.connection.js";
import helmet from "helmet";
import cors from "cors"

const app = express();

// Parser middleware
app.use(express.json());



//CORS
const whitelist = process.env.WHITE_LISTED_ORIGINS
const corsOptions = {
    origin: function (origin, callback) {
        console.log("origin: ", origin);
        
        if ( !origin || whitelist.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}
app.use(cors(corsOptions))

//database connection
dbConnection(); 

// Handle routes
app.use("/users", userRouter);
app.use("/messages", messageRouter);

// Error handling middleware
app.use(async(error, req, res, next) => {
    console.log("session inside error handling middleware: " , req.session);

    if(req.session && req.session.inTransaction()){

        //abort transaction
        await req.session.abortTransaction()
        //end session
        req.session.endSession()
        return res.status(500).json({ message: "the transaction is aborted" })
    }
    res.status(error.cause||500).json({ message: "something broke!", error: error.message ,stack: error.stack });
});

//Not found middleware
app.use((req, res) => {
    res.status(404).send("Page Not found!");
});

// Start server
app.listen(process.env.PORT, () => {
    console.log("Server is running on port 3000");
});

