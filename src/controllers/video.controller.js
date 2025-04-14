import mongoose, {isValidObjectId} from "mongoose";
import { Video } from "../models/video.model.js";
import {User} from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    // TODO: get all vidoes based on query, sort, pagination
    const {page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId = req.user._id} = req.query
    
    if(!userId || !mongoose.isValidObjectId(userId)){
        throw new ApiError(400, "UserId is required and in correct format")
    }

    const filter = {owner : userId}

    // now applying the filter to match the title as string and substring with case insensitivity
    if(query){
        // regex is for string and substring matching
        // options i is for case insensitive matching
        filter.$or = [
            {title : {$regex: query, $options: "i"}},
            {description : {$regex: query, $options: "i"}},
            {thumbnail : {$regex: query, $options: "i"}},
        ]
        
    }

    const sortOder = sortType === "asc" ? 1 : -1;
    // this will make somethiing like {createdAt: -1} or {createdAt: 1}
    const sortOptions = {[sortBy] : sortOder}
    
    // calculates how many items to skip based on the page and limit
    const skip = (page - 1) * limit;
    
    // populates takes the owner which is just the id and reference it in the user model and brings the given feilds from there
    const videos = await Video
    .find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(Number(limit))

    if(!videos){
        throw new ApiError(404, "error in fetching videos")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, videos, "videos fetched successfully")
    )
})

const publishVideo = asyncHandler(async (req, res) => {
    // TODO : get video, upload to clodinary and create video
    const {title, description} = req.body

    // things needed : videoFile, thumbnail, owner, duration(from cloudinary),
    // description, title

    // given by verifyjwt middleware
    const userId = req.user?._id

    // this check if not that important but still
    if(!userId || !mongoose.isValidObjectId(userId)){
        throw new ApiError(400, "UserId is required and in correct format")
    }

    // get the videoFile and thumbnail
    const videoFile = req.files?.videoFile[0]?.path
    const thumbnail = req.files?.thumbnail[0]?.path

    // now apply check on the data received from the user
    if(!title || !description){
        throw new ApiError(400, "title and description are required")
    }

    if(!videoFile || !thumbnail){
        throw new ApiError(400, "videoFile and thumbnail are required")
    }

    // now upload the videoFile and the thumbnail on cloudinary and get the url from cloudinary
    const uploadedVideo = await uploadOnCloudinary(videoFile)
    const uploadedThumbnail = await uploadOnCloudinary(thumbnail)

    if(!uploadedVideo){
        throw new ApiError(500, "error in uploading video on cloudinary")
    }

    if(!uploadedThumbnail){
        throw new ApiError(500, "error in uploading thumbnail on cloudinary")
    }

    // now create the video object and save it in the database
    const video = await Video.create({
        videoFile: uploadedVideo.url,
        thumbnail: uploadedThumbnail.url,
        owner: userId,
        duration: uploadedVideo.duration,
        title,
        description
    })

    if(!video){
        throw new ApiError(500, "error in creating video object")
    }

    // now save the video object in the video db
    await video.save();

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "video published successfully")
    )


})

const getVideoById = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400, "videoId is required and in correct format")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, "video not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "video fetched successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    // TODO: update video details like title, description, thumbnail

    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400, "videoId is required and in correct format")
    }

    // title, description, videoFile, thumbnail anything can be updated
    const {title, description} = req.body
    // const videoFile = req.files?.videoFile[0]?.path
    // const thumbnail = req.files?.thumbnail[0]?.path

    const videoFile = req.files && req.files.videoFile ? req.files.videoFile[0]?.path : undefined
    const thumbnail = req.files && req.files.thumbnail ? req.files.thumbnail[0]?.path : undefined


    if(!title && !description && !videoFile && !thumbnail){
        throw new ApiError(400, "at least one feild is required")
    }

    const updatedData = {}
    if(title) updatedData.title = title
    if(description) updatedData.description = description

    if(videoFile){
        const uploadedVideo = await uploadOnCloudinary(videoFile)
        if(!uploadedVideo){
            throw new ApiError(500, "error in uploading video on cloudinary")
        }
        updatedData.videoFile = uploadedVideo.url
    }
    if(thumbnail){
        // upload the videoFile and thumbnail on cloudinary
        const uploadedThumbnail = await uploadOnCloudinary(thumbnail)
    
        if(!uploadedThumbnail){
            throw new ApiError(500, "error in uploading thumbnail on cludinary")
        }
        updatedData.thumbnail = uploadedThumbnail.url
    }


    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: updatedData
        },
        {new: true} // gives the updated video object is returned and not the original one
    )

    if(!updatedVideo){
        throw new ApiError(404, "error while updating video")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedVideo, "video updated successfully")
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400, "videoId is required and in correct format")
    }

    // find the video by id and delete it
    const deletedVideo = await Video.findByIdAndDelete(videoId)

    if(!deletedVideo){
        throw new ApiError(404, "error while deleting video")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, deletedVideo, "video deleted successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400, "videoId is required and in correct format")
    }

    // find the video by id and update the publish status
    const video = await Video.findById(videoId)

    if(video.isPublished){
        video.isPublished = false
    }
    else video.isPublished = true

    const updatedVideo = await video.save()

    if(!updatedVideo){
        throw new ApiError(404, "error while updating video")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedVideo, "video published status updated successfully")
    )
})

export {
    getAllVideos,
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}