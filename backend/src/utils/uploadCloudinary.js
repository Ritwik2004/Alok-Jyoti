import { v2 as cloudinary } from "cloudinary";
import fs from "fs";


cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET,
    timeout: 60000,
});


const uploadCloudinary = (async (localpath) => {
    try{
        console.log("local path : ",localpath)
        if(!localpath)
            return false;
        const response = await cloudinary.uploader.upload
        (localpath,
            {
                resource_type : "auto"
            }
        )
        fs.unlinkSync(localpath);
        console.log("avatar url : ",response.url)
        return response;
    }
    catch(error)
    {
        fs.unlinkSync(localpath);
        console.log("there is an error..........: ",error)
        return null;
    }
})

export {uploadCloudinary};