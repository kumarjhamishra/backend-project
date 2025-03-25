//require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";


dotenv.config({
    path: './.env'
})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`server is listening on port ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("error of catch of connectDB of src/index.js", err);
})







/*
import express from "express"
const app = express()
// iffi an efficient way to connnect to the database
(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            HTMLFormControlsCollection.log("ERROR: ", error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`APP is listening on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.error("ERROR: ", error)
        throw err
    }
})()
    */