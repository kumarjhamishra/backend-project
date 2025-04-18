import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
    videoFile: {
        type: String, // cloudinaru url
        required: true,
    },
    thumbnail: {
        type: String, // cloudinary url
        required: true 
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User", 
        required: true,
    },
    duration: {
        type: Number, // cludinary url
        required: true,
    },
    views: {
        type: Number, 
        default: 0,
    },
    isPublished: {
        type: Boolean, 
        default: true,
    },
    description: {
        type: String,
        required: true
    },
    title: {
        type: String, 
        required: true,
    },
}, {timestamps: true})



videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)