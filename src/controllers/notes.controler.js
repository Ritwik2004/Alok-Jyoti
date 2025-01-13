import { AsyncHandeler } from "../utils/asyncHandeler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadCloudinary } from "../utils/uploadCloudinary.js";
import mongoose, { Schema } from "mongoose";
import { Notes } from "../models/notes.model.js";

const uploadNotes = AsyncHandeler(async(req,res)=>{
    const { title, description, author, sem, subject } = req.body
    if(!title || !description || !author || !sem || !subject ){
        throw new ApiError(404,"All fields are required...")
    }
    const noteLocalPath = req.files?.note[0]?.path;
    if(!noteLocalPath){
        throw new ApiError(404,"Note file is missing...")
    }
    const note = await uploadCloudinary(noteLocalPath);
    if(!note){
        throw new ApiError(401,"Something Went Wrong while uploading on cloudinary...")
    }
    const noteDetails = await Notes.create({
        notesFile : note.url,
        title,
        description,
        author,
        sem,
        subject,
        woner : req.user._id
    })
    if(!noteDetails){
        throw new ApiError(401,"Somethig went Wrong while create object...")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,noteDetails,"Note Uploaded successfully!")
    )
})

const deletDocument = AsyncHandeler(async(req,res)=>{
    const {noteId} = req.body
    await Notes.deleteOne({
        _id: new mongoose.Types.ObjectId(noteId)
    })
    return res 
    .status(200)
    .json(
        new ApiResponse(200,{},"Document deleted successfully!")
    )

})

export {
    uploadNotes,
    deletDocument
}