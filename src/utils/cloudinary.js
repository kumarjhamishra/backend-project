import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath){
            return `file path is not present`
        }

        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        // file has been successfully uploaded
        //console.log("file has been uploaded successfully", response.url)
        fs.unlinkSync(localFilePath);
        return response
    } catch (error) {

        // for safety purpose unlink the file from our local server
        try {
            fs.unlinkSync(localFilePath);
        } catch (unlinkError) {
            console.error("Error while deleting the file:", unlinkError.message);
        }

        console.error("Error during upload:", error.message);
        return null;
    }
}

export {uploadOnCloudinary}


