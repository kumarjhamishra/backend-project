import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      // putting index optimizes searches but hampers performances
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // cloudinary url
      required: true,
    },
    coverImage: {
      type: String, // cloudinaru url
    },
    watchHistory: [
      {
          type: Schema.Types.ObjectId,
          ref: "Video"
      }
  ],
    password: {
      type: "String",
      required: [true, "Password is necessary"],
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);


// custom middleware

// function is made with function keyword because it has the this knowledge and it is not an random function
userSchema.pre("save", async function (next) {
    // if the password is not modified then don't run this function faaltu me and simply reuturn
    if(!this.isModified("password")){
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10)
    next()
})


// custom methods we are making - for comparing password
userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password)
}

// function to generate token
userSchema.methods.generateAccessToken = async function (){
    return await wt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = async function (){
    return await wt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema);
