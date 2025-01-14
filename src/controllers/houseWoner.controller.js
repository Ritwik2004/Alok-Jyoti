import { AsyncHandeler } from "../utils/asyncHandeler.js";
import { ApiError } from "../utils/ApiError.js";
import { HouseWoner } from "../models/HouseWoner.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import { uploadCloudinary } from "../utils/uploadCloudinary.js";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = (async(userId)=>{
    try{
        const user = await HouseWoner.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave : false});
        return {accessToken,refreshToken};
    }
    catch(error)
    {
        throw new ApiError(500,"Something went wrong while generate access and refresh token...")
    }
})

 const registerHouseWoner = AsyncHandeler(async (req,res) =>{
//(worked without coverImage and scanner that means photos are not uploaded)


    // algorithm :-
    
    //1. get data from user 
    //2. validation (not empty)
    //3. check if user previously exist or not(email,username)
    //4. check if avatar is given or not upload avatar on cloudinary
    //5. create user object
    //6. remove password and token
    //7. check user create or not
    //8. return res
    // 1. getdata
    const {fullname,PhNo,email,PaymentMode,UpiId,Address,HouseNo,password,username} = req.body;

    // console.log(fullname,username,PhNo,email,PaymentMode,UpiId,Address,HouseNo,password);
// 2. validation
    if(
        [fullname,PhNo,email,PaymentMode,Address,HouseNo,password,username].some((field)=>
            field?.trim== "")
    ){
        throw new ApiError(400,"All fields are required")
    }
    // console.log("pass validation")
// 3.check if user previously exist or not
    const existeduser = await HouseWoner.findOne({
        $or: [{email},{username}]
    })
    if(existeduser){
        throw new ApiError(409,"User with this email or username is already exist...");
    }
    // console.log("pass exist user")
//4. check if scanner and avatar is given or not and upload in cloudinary
    // console.log("Scanner")
    // console.log(req.files)
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // console.log("Avatar : ",avatarLocalPath)
    let Avatar
    if(avatarLocalPath){
        Avatar = await uploadCloudinary(avatarLocalPath);
    }
// console.log("avatar passed")
    const ScannerLocalPath = req.files?.scanner?.[0]?.path;
    
    let Scanner;
    if (ScannerLocalPath) {
        // console.log("Scanner local path : ",ScannerLocalPath)
        Scanner = await uploadCloudinary(ScannerLocalPath);
    }
    // console.log("pass cloudinary")
//5. create user object
    const user = await HouseWoner.create({
        fullname,
        username,
        email,
        PhNo,
        PaymentMode,
        UpiId : UpiId || "",
        Scanner : Scanner?.url || "",
        avatar : Avatar?.url || "",
        Address,
        HouseNo,
        password
    })
// 6. remove password and token
    const createdWoner = await HouseWoner.findById(user._id).select(
        "-password -refreshToken"
    )
//7. check if new user is created or not in DB
    if(!createdWoner){
        throw new ApiError(500,"Something went wrong...")
    }
//8. return response
    return res.status(201).json(
        new ApiResponse(200,createdWoner,"User registered successfully...")
    )
 })

const HouseWonerLogin = AsyncHandeler(async(req,res)=>{
    //req body -> data
    //verify user by username or emailId
    //check password
    //generate accessToken and refreshToken
    //send them by using cookies

// 1. collect deta from req.body
    const {email,PhNo,password} = req.body

    if(!email || !PhNo || !password)
    {
        throw new ApiError(400,"All the fields are required...")
    }
//2. verify
    const woner = await HouseWoner.findOne({
        $or : [{email},{PhNo}]
    })
    if(!woner){
        throw new ApiError(404,"User doesnot exist...")
    }
//3. check password
    const PasswordCorrect = await HouseWoner.isPasswordCorrect(password);
    if(!PasswordCorrect){
        throw new ApiError(404,"incorrect password...");
    }
//4. generate access and refresh token
    const {accessToken,refreshToken} = generateAccessAndRefreshToken(woner._id);
//5. hide refresh token and password 
    const loggedinWoner = await HouseWoner.findById(woner._id).select("-password -refreshToken -available");

    const options = {
        httpOnly : true,
        secure : true
    }
//6. send response
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken".refreshToken,options)
    .json(
        new ApiResponse(
            200,{
                user: loggedinWoner, accessToken,refreshToken
            },
            "User logged in successfully"
        )
    )
})

const logoutWoner = AsyncHandeler(async(req,res) =>{
    await HouseWoner.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken : undefined
            }
        },
        {
            new : true
        }
    )
    const option = {
        httpOnly : true,
        secure : true
    }
    return res
    .status(200)
    .clearCookie("accessToken",option)
    .clearCookie("refreshToken",option)
    .json(
        new ApiResponse(200,{},"User loggedout successfully...")
    )
})

const getProfile = AsyncHandeler(async(req,res)=>{
    // const user = await HouseWoner.findById(req.user?._id).select();
    const details = await HouseWoner.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup : {
                from : "rooms",
                localField : "_id",
                foreignField : "woner",
                as : "AllRooms"
            }
        },
        {
            $addFields : {
                NoOfRooms : {
                    $size : "$AllRooms"
                }
            }
        },
        {
            $project : {
                "NoOfRooms.NoOfStudents" : 1,
                "NoOfRooms.RoomType" : 1,
                "NoOfRooms.flore" : 1,
                "NoOfRooms.rent" : 1,
                "NoOfRooms.image1" : 1,
                "AllRooms" : 1,
                "fullname" : 1,
                "avatar" :1,
                "PhNo" : 1,
                "email" : 1,
                "UpiId" : 1,
                "PaymentMode" : 1,
                "Address" : 1
            }
        }
    ])
    if(!details?.length)
    {
        throw new ApiError(404,"Details doesnot exist...")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,details[0],"woner details fetched successfully...")
    )
})

const WonerRefreshAccessToken = AsyncHandeler(async(req,res)=>{
    const incommingrefreshToken = req.cookies.refreshAccessToken || req.body.refreshToke
    if(!incommingrefreshToken){
        throw new ApiError(404,"refreshToken Unavaliable...");
    }
    try {
        const decodedAccessToken = jwt.verify(
            incommingrefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const wonerUser = await HouseWoner.findById(decodedAccessToken?._id);
        if(!wonerUser){
            throw new ApiError(404,"HouseWoner id unavaliable!!!")
        } 
        if(incommingrefreshToken != wonerUser?.refreshToken){
            throw new ApiError(401,"refreshToken is expired or used...")
        }
        const {newAccessToken,newRefreshToken} = generateAccessAndRefreshToken(wonerUser._id);
        const option = {
            httpOnly : true,
            secure : true
        }
        return res
        .status(200)
        .cookie("accessToken",newAccessToken)
        .cookie("refreshToken",newRefreshToken)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken : newAccessToken,
                    refreshToke : newRefreshToken
                },
                "Accesstoken refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(400,error?.message || "Invalid refresh Token")
    }
})

const updateWonerAvatar = AsyncHandeler(async(req,res)=>{
    const avatarLocalPath = req.files?.avatar[0]?.path;
    if(!avatarLocalPath)
    {
        throw new ApiError(404,"Avatar file not found...")
    }
    const avatar = await uploadCloudinary(avatarLocalPath);
    if(!avatar){
        throw new ApiError(401,"Something went wrong while uploading cloudinary...");
    }
    const woner = await HouseWoner.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                avatar : avatar.url
            }
        },
        {
            new : true
        }
    ).select("-password")
    return res
    .status(200)
    .json(
        new ApiResponse(200,woner,"Avatar update successfully...")
    )
})

const changeWonerPassword = AsyncHandeler(async(req,res)=>{
    const {oldPassword,newPassword} = req.body;
    if(!oldPassword || !newPassword){
        throw new ApiError(404,"All elements are required...")
    }
    const woner = await HouseWoner.findById(req.user?.username);
    const passwordValidation = await HouseWoner.isPasswordCorrect(oldPassword);
    if(!passwordValidation){
        throw new ApiError(404,"Old password is not correct...")
    }
    HouseWoner.password = newPassword;
    HouseWoner.save({validateBeforeSave : false})
    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Password change successfully...")
    )
})

const changeScanner = AsyncHandeler(async(req,res)=>{
    const ScannerLocalPath = req.files?.scanner[0]?.path;
    if(!ScannerLocalPath){
        throw new ApiError(404,"Scanner not found...")
    }
    const Scanner = uploadCloudinary(ScannerLocalPath);
    if(!Scanner){
        throw new ApiError(404,"Error while uploading on cloudinary...")
    }
    const woner = await HouseWoner.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                Scanner : Scanner.url
            }
        },
        {
            new : true
        }
    )
    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Scanner changed successfully...")
    )
})

const changeUpiId = AsyncHandeler(async(req,res)=>{
    const {upiId} = req.body;
    if(!upiId){
        throw new ApiError(404,"Upi Id is required...")
    }
    await HouseWoner.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                UpiId : upiId
            }
        },
        {
            new : true
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Upi id updater successfully...")
    )
})

const changeEmail = AsyncHandeler(async(req,res)=>{
    const {email} = req.body;
    if(!email){
        throw new ApiError(404,"Email id required...")
    }
    await HouseWoner.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                email : email
            }
        },
        {
            new : true
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Email Id update successfully...")
    )
})

export {
    registerHouseWoner,
    HouseWonerLogin,
    logoutWoner,
    getProfile,
    WonerRefreshAccessToken,
    updateWonerAvatar,
    changeWonerPassword,
    changeScanner,
    changeUpiId,
    changeEmail
}