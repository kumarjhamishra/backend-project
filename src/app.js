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

export {app}