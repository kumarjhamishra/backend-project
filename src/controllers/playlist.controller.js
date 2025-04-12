import mongoose, {isValidObjectId} from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
    // TODO: create playlist

    const {name, description} = req.body
    const userId = req.user._id

    if(!name || !description){
        throw new ApiError(400, "name and description of playlist are required")
    }
    
    if(!userId){
        throw new ApiError(400, "userId is required")
    }

    // check if the same user has created a playlist with the same name
    const existedPlaylist = await Playlist.findOne(
        {
            name: name,
            owner: userId
        }
    )

    if(!existedPlaylist){
        throw new ApiError(409, "user has already created a playlist with the same name")
    }

    // create the playlist
    const playlist = await Playlist.create(
        {
            name: name,
            owner: userId,
            description: description,
            videos: []
        }
    )

    if(!playlist){
        throw new ApiError(500, "error in creating a new playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "playlist has been successfully created")
    )

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    //TODO: get user playlists

    const {userId} = req.params
    
    if(!userId){
        throw new ApiError(400, "userId is required")
    }

    // get all the playlists with this userId
    const playlists = await Playlist.aggregate([
        // first pipeline to match all those playlists whose userId matches
        {
            $match: {
                owner: new mongoose.Types.ObjectId(`${userId}`)
            }
        },
        // sort the playlists with latest created first
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videoDetails"
            }
        },
    ])

    if(!playlists || playlists.length === 0){
        throw new ApiError(404, "playlist not found or empty")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlists, "playlist fetched successfully")
    )

})

const getPlaylistById = asyncHandler(async (req, res) => {
    //TODO: get playlist by id

    const {playlistId} = req.params

    if(!playlistId || !isValidObjectId(playlistId)){
        throw new ApiError(400, "playlistId is required and in correct format")
    }

    const playlist = await Playlist.aggregate([
        {
            // _id is not a feild, but stored by mogodb therefor no $ sign
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        },
    ])

    if(!playlist || playlist.length === 0){
        throw new ApiError(404, "error in fetching playlist with id or empty playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "playlist with id fetched successfully")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!playlistId){
        throw new ApiError(404, "playlistId is required")
    }

    if(!videoId){
        throw new ApiError(404, "videoId is required")
    }

    // find the playlist in the database
    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404, "playlist not found")
    }

    // check if the video already exists in the playlist
    if(playlist.videos.includes(videoId)){
        throw new ApiError(400, "video already exists iin the playlist")
    }

    // add the video in it's videos array
    playlist.videos.push(videoId)

    // save the playlist
    await playlist.save()

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "video added to playlist successfully")
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!playlistId){
        throw new ApiError(400, "playlistId is required")
    }
    if(!videoId){
        throw new ApiError(400, "videoId is required")
    }

    // check if the playlist exists
    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404, "playlist not found")
    }

    // check if the video is the part of playlist
    if(!playlist.videos.includes(videoId)){
        throw new ApiError(400, "video is not the part of playlist")
    }

    // remove the video from the videos array
    playlist.videos = playlist.videos.filter(
        (id) => id.toString() !== videoId
    )

    await playlist.save()

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "video deleted from playlist successfully")
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    if(!playlistId){
        throw new ApiError(400, "playlistId is required")
    }

    // now find the playlist by it's id and delete it
    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)

    if(!deletedPlaylist){
        throw new ApiError(404, "error in deleting the playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, deletedPlaylist, "playlist deleted successfully")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body

    if(!playlistId){
        throw new ApiError(400, "playlistId is required")
    }

    // find the playlist with the playlistId
    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404, "playlist not found")
    }

    // now update it's name and description
    // trim function removes the white spaces from the beginning and from the end
    if(name && name.trim().length > 0){
        playlist.name = name.trim()
    }
    if(description && description.trim().length > 0){
        playlist.description = description.trim()
    }

    // save the updated playlist
    await playlist.save()

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "playlist updated successfully")
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}