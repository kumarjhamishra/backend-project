import mongoose, {isValidObjectId} from "mongoose";
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    // TODO: toggle like on video

    const {videoId} = req.params
    const userId = req.user._id

    if(!userId || !isValidObjectId(userId)){
        throw new ApiError(400, "userId is required and in valid format")
    }

    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400, "videoId is required and in valid format")
    }

    // find the like if not present , make a new like and if already present then delete it
    const isLiked = await Like.findOne({
        video: videoId,
        likedBy: userId
    })

    if(!isLiked){
        const like = await Like.create({
            video: videoId,
            likedBy: userId
        })
        if(!like){
            throw new ApiError(400, "error while creating a new like")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, like, "like created successfully")
        )
    }
    else{
        const deletedLike = await Like.findOneAndDelete(
            {
                video: videoId,
                likedBy: userId
            }
        )
        if(!deletedLike){
            throw new ApiError(400, "error while deleting the like")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, deletedLike, "like deleted successfully")
        )
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    // TODO: toggle like on comment
    const {commentId} = req.params

    if(!commentId || !isValidObjectId(commentId)){
        throw new ApiError(400, "commentId is required and in correct format")
    }

    // if the like is not present , make a new like document 
    // and if already present find that document and delete it

    const userId = req.user._id
    if(!userId || !isValidObjectId(userId)){
        throw new ApiError(400, "userId is required and in valid format")
    }

    const isLiked = await Like.findOne({
        comment: commentId,
        likedBy: userId
    })

    if(!isLiked){
        const like = await Like.create({
            comment: commentId,
            likedBy: userId
        })
        if(!like){
            throw new ApiError(400, "error while creating a new like on comment")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, like, "like created successfully on comment")
        )
    }
    else{
        const deletedLike = await Like.findOneAndDelete(
            {
                comment: commentId,
                likedBy: userId
            }
        )
        if(!deletedLike){
            throw new ApiError(400, "error while deleting the like on comment")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, deletedLike, "like deleted successfully on the comment")
        )
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    // TODO: toggle like on tweet
    const {tweetId} = req.params

    if(!tweetId || !isValidObjectId(tweetId)){
        throw new ApiError(400, "tweetId is required and in correct format")
    }

    const userId = req.user._id
    if(!userId || !isValidObjectId(userId)){
        throw new ApiError(400, "userId is required and in valid format")
    }

    const isLiked = await Like.findOne({
        tweet: tweetId,
        likedBy: userId
    })

    if(!isLiked){
        const like = await Like.create({
            tweet: tweetId,
            likedBy: userId
        })
        if(!like){
            throw new ApiError(400, "error while creating a new like on tweet")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, like, "like created successfully on tweet")
        )
    }
    else{
        const deletedLike = await Like.findOneAndDelete(
            {
                tweet: tweetId,
                likedBy: userId
            }
        )
        if(!deletedLike){
            throw new ApiError(400, "error while deleting the like on tweet")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, deletedLike, "like deleted successfully on the tweet")
        )
    }


})

const getLikedVideos = asyncHandler(async (req, res) => {
    // TODO: get all liked videos
})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}