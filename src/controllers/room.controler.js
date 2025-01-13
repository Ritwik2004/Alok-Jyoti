import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandeler } from "../utils/asyncHandeler.js";
import { uploadCloudinary } from "../utils/uploadCloudinary.js";
import Mongoose from "mongoose";
import { Room } from "../models/Room.model.js";
import mongoose from "mongoose";

const uploadRooms = AsyncHandeler(async(req,res)=>{
    const { roomType, floor, noOfStudents, feature, rent, downPayment, avaliable } = req.body
    if(!roomType || !floor || !noOfStudents || !feature || !rent || !downPayment ||!avaliable){
        throw new ApiError(404,"All filds are required...")
    }
    const image1LocalPath = req.files?.image1[0]?.path;
    const image2LocalPath = req.files?.image2[0]?.path;
    const image3LocalPath = req.files?.image3[0]?.path;
    if(!image1LocalPath || !image2LocalPath || !image3LocalPath){
        throw new ApiError(404,"All 3 images are required...")
    }
    const image1 = await uploadCloudinary(image1LocalPath)
    const image2 = await uploadCloudinary(image2LocalPath)
    const image3 = await uploadCloudinary(image3LocalPath)
    if(!image1 || !image2 || !image3){
        throw new ApiError(401,"Something went wrong while uploading images on cloudinary...")
    }
    const roomDetails = await Room.create({
        roomType,
        flore : floor,
        noOfStudints : noOfStudents,
        image1 : image1.url,
        image2 : image2.url,
        image3 : image3.url,
        feature,
        rent,
        downPayment,
        avaliable,
        owner : req.user._id
    })
    if(!roomDetails){
        throw new ApiError(401,"Something went wrong while create object...")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,roomDetails,"Room is ready to visit...")
    )
})

const updateAvaliable = AsyncHandeler(async(req,res)=>{
    const { status } = req.body;
    const roomId = req.params.trim();
    if(!roomId){
        throw new ApiError(404,"Room id Not Found...")
    }
    const room = await Room.findById(roomId)
    if(room.owner != req.user._id){
        throw new ApiError(401,"Sorry! You are not the woner of this room!!!")
    }
    const updatedRoomDetails = await Room.findByIdAndUpdate(
        roomId,
        {
            $set:{
                avaliable : status
            }
        },
        {
            new : true
        }
    )
    return res
    .status(200)
    .json(
        new ApiResponse(200,updatedRoomDetails,"Avaliable status changed successfully...")
    )
})

const deletRoom = AsyncHandeler(async(req,res)=>{
    const { roomId } = req.body
    await Room.deleteOne({
        _id: new mongoose.Types.ObjectId(roomId)
    })

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Room deleted successfully...")
    )
})

export{
    uploadRooms,
    updateAvaliable,
    deletRoom
}