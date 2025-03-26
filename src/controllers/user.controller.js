import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { upload } from "../middlewares/multer.middleware.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "user not found");
    }

    // now generate tokens
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    // save the refresh token in db
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error in generating tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - like not empty
  // check if user already exists - either by username or email
  // check for images , check for avatar image (compulsory)
  // upload them to clodinary, avatar
  // create user object - create entry in db
  // remove passwrod and refresh token feilds from repsonse
  // check for user creation
  // return response

  const { fullname, email, username, password } = req.body;
  //console.log(`email: ${email}, fullname: ${fullname}, username: ${username}, password: ${password}`)

  if (
    [fullname, email, username, password].some((feild) => feild?.trim() === "")
  ) {
    throw new ApiError(400, "All feilds are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with this email or username already exists");
  }

  //console.log(req.files);

  const avatarLocalPath = req.files?.avatar[0]?.path;
  //const coverImageLocalPath = req.files?.coverImage[0]?.path

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // upload them to cloudinary
  // this uploading will take time
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    username: username.toLowerCase(),
    password,
  });

  // removing password and refresh token -> "-" means these feilds are need to be removed
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "user is not registered properly");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

// to do's for login
/*
get username, email and password from user
authenticate username, email and password 
find the user
check password
get refresh token and access token
send cookies
if everything is ok then give him access along with the access token generated and refresh token
*/
const loginUser = asyncHandler(async (req, res) => {
  // get the data from request body
  const { username, email, password } = req.body;

  // at least username or email we want
  if (!username || !email) {
    throw new ApiError(400, "username or email is required");
  }

  // find the user with the email and username
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  // user not found
  if (!user) {
    throw new ApiError(404, "username or email is invalid");
  }

  // check the password
  const isPasswordCorrect = await user.isPasswordCorrect(password);

  // incorrect password
  if (!isPasswordCorrect) {
    throw new ApiError(401, "password is incorrect");
  }

  // generate access token and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  // send them in cookies
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // now only server can update the cookie and not the frontend
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});


const logoutUser = asyncHandler(async (req, res) => {
  // for logout of user remove it's cookies
  
  // find user
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"))
})

export { registerUser, loginUser, logoutUser };
