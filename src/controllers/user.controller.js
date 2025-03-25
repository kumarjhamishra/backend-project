import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { upload } from "../middlewares/multer.middleware.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - like not empty
    // check if user already exists - either by username or email
    // check for images , check for avatar image (compulsory)
    // upload them to clodinary, avatar
    // create user object - create entry in db
    // remove passwrod and refresh token feilds from repsonse
    // check for user creation
    // return response

    const {fullname, email, username, password} = req.body
    //console.log(`email: ${email}, fullname: ${fullname}, username: ${username}, password: ${password}`)

    if(
        [fullname, email, username, password].some((feild) => 
            feild?.trim() === ""
        )
    ){
        throw new ApiError(400, "All feilds are required")
    }

    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if(existedUser){
        throw new ApiError(409, "User with this email or username already exists")
    }

    //console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path
    //const coverImageLocalPath = req.files?.coverImage[0]?.path

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    // upload them to cloudinary
    // this uploading will take time
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)


    if(!avatar){
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        username: username.toLowerCase(),
        password
    })

    // removing password and refresh token -> "-" means these feilds are need to be removed
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "user is not registered properly")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

})

export {registerUser}