import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt, { decode } from "jsonwebtoken";

// this middleware will verify whether user is present or not
export const verifyJWT = asyncHandler(async (req, _, next) => {

    // get the cookie from request
    // after or the code is to get the token from mobile appilcation as it's come in form of header from mobile application
    try {
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if(!accessToken){
            throw new ApiError(401, "You are not authenticated")
        }
    
    
        // now verify the token from jwt
        const decodedAccessToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
    
        const updatedUser = await User.findById(decodedAccessToken?._id).select("-password -refreshToken")
        if(!updatedUser){
            throw new ApiError(401, "Invalid access token")
        }
    
        req.user = updatedUser
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "You are not authenticated")
    }

})