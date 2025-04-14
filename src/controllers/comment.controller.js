import mongoose, { mongo } from "mongoose";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Comment} from "../models/comment.model.js"


const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video

    /*
    1. get the video id of the video
    2. search all the comments objects with that video id
    3. make a response storing the comment id's 
    4. return that 
    */
    
    const {videoId} = req.params

    if(!videoId){
        throw new ApiError(400, "videoId is required")
    }

    // now we will find all the comments for this videoId using pipeline
    const comments = await Comment.aggregate([
        // first pipeline to get only those documents whose video id matches
        {
            $match: {video: new mongoose.Types.ObjectId(`${videoId}`)}
        },
        // second pipeline for the left join with users model
        {
            $lookup: {
                // in mongodb it became lowercase and plural
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "videoComments",
                pipeline: [
                    // nested pipeline to select only some feilds
                    {
                        $project: {
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        }
    ])
    // output will be in the array form

    if(!comments){
        throw new ApiError(404, "problem in fetching comments")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, comments, "comments fetched successfully")
    )

})

const addComment = asyncHandler(async (req, res) => {
    // add a comment to a video
    /*
    1. get the userid from req
    2. get the video id from req
    3. get the comment from the req
    4. make a new document of comment with the user id and video id and save it in database
    */

    const userId = req.user._id
    const {videoId} = req.params
    const {content} = req.body

    if(!userId || !videoId){
        throw new ApiError(400, "userId or videoId is not available")
    }

    if(content.trim().length === 0){
        throw new ApiError(400, "Comment cannot be empty")
    }

    // create method makes the new document and saves it in db
    const newComment = await Comment.create(
        {
            content: content,
            video: videoId,
            owner: userId
        }
    )

    if(!newComment){
        throw new ApiError(400, "error while creating new comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, newComment, "comment added successfully")
    )
    
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    /**
    1. extract the comment id, user id and video id
    2. now for that comment id find it the db and update it with the new content and save it
    3. return this updated comment
     */
 
    const {commentId} = req.params
    const {content} = req.body

    if(!commentId){
        throw new ApiError(400, "commentId is required")
    }

    if(content.trim().length === 0){
        throw new ApiError(400, "comment is empty")
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content
            }
        },
        {
            new: true
        }
    )

    if(!updatedComment){
        throw new ApiError(400, "comment is not updated properly")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedComment, "comment is updated successfully")
    )

})

const deleteComment = asyncHandler(async (req, res) => {
    // get the comment id
    const {commentId} = req.params
    // check if it's available and in correct format
    if (!commentId) {
        throw new ApiError(400, "Comment ID is required");
    }

    // Check if the comment exists and belongs to the user
    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
        throw new ApiError(404, "error in deleting the comment");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, deletedComment, "comment has been deleted successfully")
    )
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}