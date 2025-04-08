import { Router } from "express";
import {
    getUserTweets,
    updateTweet,
    deleteTweet,
    createTweet,
} from "../controllers/tweet.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router()
// apply verifyJWT middleware to all routes in this file

router.use(verifyJWT)

router.route("/").post(createTweet)
router.route("/user/:userId").get(getUserTweets)
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet)

export default router