import express from "express";
import userRouter from "./Modules/Users/user.controller.js";
import messageRouter from "./Modules/Messages/message.controller.js";
import dbConnection from "./DB/db.connection.js";

const app = express();

// Parser middleware
app.use(express.json());

//database connection
dbConnection(); 

// Handle routes
app.use("/users", userRouter);
app.use("/messages", messageRouter);

// Error handling middleware
app.use((error, req, res, next) => {
    console.log(error.stack);
    res.status(500).send("Something went wrong!");
});

//Not found middleware
app.use((req, res) => {
    res.status(404).send("Page Not found!");
});

// Start server
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

