import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

// configuration of cors
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// configuration settings for middlewares
// setting the size of json we will accept
app.use(express.json({limit: "16kb"}))
// configuration for data from url
app.use(express.urlencoded({extended: true, limit: "16kb"}))
// configuration to store the files on server
app.use(express.static("public"))
app.use(cookieParser())


// import routes

import userRouter from "./routes/user.routes.js"
import commentRouter from "./routes/comment.routes.js"

// routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/comments", commentRouter)

// http://localhost:8000/api/v1/users/register

export {app}