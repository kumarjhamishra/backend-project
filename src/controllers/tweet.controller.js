import mongoose, {isValidObjectId} from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create a tweet
    const userId = req.user?._id

    if(!userId || !isValidObjectId(userId)){
        throw new ApiError(400, "userId is required and in correct format")
    }

    const {content} = req.body

    if(!content){
        throw new ApiError(400, "tweet is empty")
    }

    const tweet = await Tweet.create({
        owner: userId,
        content
    })

    if(!tweet){
        throw new ApiError(400, "error in creating tweet")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, tweet, "tweet created successfully")
    )
})


const getUserTweets = asyncHandler(async (req, res) => {
    // To fetch and return all tweets made by a particular user (usually based on userId).

    //TODO: get user tweets
    const {userId} = req.params

    if(!userId || !isValidObjectId(userId)){
        throw new ApiError(400, "userId is required and in correct format")
    }

    // now we need to fetch all the tweets with this user id and through the pipeline and userId get the owner details from the users database
    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(`${userId}`)
            }
        },
        {
            $sort: {
                createdAt: -1 // most recent tweet first
            }
        },
        {
            // left outer join
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "userDetails"
            }
        },
        {
            // flattens the userDetails array into a single object
            $unwind: "$userDetails"
        },
        {
            // project only selective feilds
            $project: {
                content: 1,
                createdAt: 1,
                updatedAt: 1,
                "userDetails.username": 1,
                "userDetails.fullname": 1,
                "userDetails.avatar": 1
            }
        },
    ])

    if(!tweets || tweets.length === 0){
        throw new ApiError(404, "no tweets found for this user")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, tweets, "tweets fetched successfully")
    )

})

const updateTweet = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    if(!userId || !isValidObjectId(userId)){
        throw new ApiError(400, "userId is required and in correct format")
    }

    const {tweetId} = req.params
    if(!tweetId || !isValidObjectId(tweetId)){
        throw new ApiError(400, "tweetId is required and in correct format")
    }

    //  we will only allow the updadte of the tweet till 10 minutes of it's creation

    /*
    implementaion: 
    get the tweet with id
    check if the tweet exists or not
    then check if the tweet is created within 10 minutes or not
    if yes then update the tweet and return the updated tweet
    if no then return the error message that tweet is not updated
    */

    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(404, "tweet not found")
    }

    const currentTime = new Date()
    const createdAt = new Date(tweet.createdAt)
    const TEN_MINUTES = 10*60*1000 // in miliseconds

    if(currentTime - createdAt > TEN_MINUTES){
        throw new ApiError(403, "tweet can only be updated within 10 minutes of creation")
    }

    const {content} = req.body

    if(!content){
        throw new ApiError(400, "tweet is empty")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content
            }
        
        },
        {
            new: true
        }
    )

    if(!updatedTweet){
        throw new ApiError(404, "tweet is not updated properly")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedTweet, "tweet is updated successfully")
    )

})

const deleteTweet = asyncHandler(async (req, res) => {
    const userId = req.user._id // get the userId from the token

    if(!userId || !isValidObjectId(userId)){
        throw new ApiError(400, "userId is required and in correct format")
    }

    const tweetId = req.params
    if(!tweetId){
        throw new ApiError(400, "tweetId is required")
    }

    // find the tweet with it's and delete it
    const deletedTweet = await Tweet.findByIdAndDelete(tweetId)

    if(!deletedTweet){
        throw new ApiError(400, "error in deleting tweet")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, deletedTweet, "tweet has been deleted successfully")
    )

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
}