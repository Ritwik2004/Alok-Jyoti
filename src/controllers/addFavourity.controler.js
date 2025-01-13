import { AsyncHandeler } from "../utils/asyncHandeler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AddFeverite } from "../models/AddToFavourit.model.js";
import mongoose from "mongoose";

const addNotes = AsyncHandeler(async(req,res)=>{
    const notesId = req.params?.trim();
    if(!notesId){
        throw new ApiError(404,"Notes not Found...")
    }
    const savedUser = req.user;
    const user = await AddFeverite.findOne({ savedBy: new mongoose.Types.ObjectId(req.user._id) });
    if(!user){
        const savedDeetails = await AddFeverite.create({
            notes : notesId,
            savedBy : savedUser
        })
        const details = await AddFeverite.findById(savedDeetails._id)
        if(!details){
            throw new ApiError(404,"Something Went Wrong While Add to the playlist...")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200,details,"Add To Playlist Successfully...")
        )
    }
    else{
        await db.users.updateOne(
            { savedBy: new mongoose.Types.ObjectId(req.user._id) },                      
            { $push: { hobbies: notesId } } 
        )
        return res
        .status(200)
        .json(
            new ApiResponse(200,{},"Add To Playlist Successfully in external playlist...")
        )
    }
})

const getFevNotes = AsyncHandeler(async(req,res)=>{
    const details = await AddFeverite.aggregate([
        {
            $match : {
                savedBy : new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup : {
                from : "notes",
                localField : "notes",
                foreignField : "_id",
                as : "note",
                pipeline : [
                    {
                        $project : {
                            notesFile : 1,
                            title : 1,
                            description : 1,
                            sem : 1,
                            subject : 1,
                            note : 1
                        }
                    } 
                ]
            }
        }
    ])
    return res
    .status(200)
    .json(
        new ApiResponse(200,details[0].note,"Feverite notes are get successfully...")
    )
})

const removeNotes = AsyncHandeler(async(req,res)=>{
    // const playlist = await db.AddFeverite.find({ savedBy: new mongoose.Types.ObjectId(req.user._id)})
    const deletableDocument = req.params.trim();
    if(!deletableDocument){
        throw new ApiError(404,"Document id not found...")
    }
    const operation = await db.users.updateOne(
        { savedBy: new mongoose.Types.ObjectId(req.user._id) },                     
        { $pull: { notes: deletableDocument } } 
    )
    if(!operation){
        throw new ApiError(401,"Something went Wrong while removed from playlist...")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Document removed from playlist...")
    )
})
export {
    addNotes,
    getFevNotes,
    removeNotes
}