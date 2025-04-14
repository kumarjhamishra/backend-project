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
import videoRouter from "./routes/video.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import likeRouter from "./routes/like.routes.js"
import healthcheckRouter from "./routes/healthcheck.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"

/*
testing sequence: playlist, dashboard, 
*/

// routes declaration
app.use("/api/v1/users", userRouter) // user routes tested
app.use("/api/v1/comments", commentRouter) // comment routes tested
app.use("/api/v1/videos", videoRouter) // video routes tested
app.use("/api/v1/tweets", tweetRouter) // tweet routes tested
app.use("/api/v1/likes", likeRouter) // like route tested
app.use("/api/v1/healthcheck", healthcheckRouter) // all routes checked
app.use("/api/v1/subscriptions", subscriptionRouter) // all routes tested
app.use("/api/v1/playlist", playlistRouter) // all routes tested
app.use("/api/v1/dashboard", dashboardRouter) // all routes tested

// http://localhost:8000/api/v1/users/register

export {app}