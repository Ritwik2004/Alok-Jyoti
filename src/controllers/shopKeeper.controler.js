import { AsyncHandeler } from "../utils/asyncHandeler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { shopkeeper } from "../models/shopkeeper.model.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = (async(userId)=>{
    try{
        const user = await shopkeeper.findById(userId);
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

const registerShopkeeper = AsyncHandeler(async(req,res)=>{
    const {fullname, username, phNo, email, shopName, location, upiId, password} = req.body
    if(!fullname || !username || !phNo || !shopName || !location || !password){
        throw new ApiError(404,"All fields are required...")
    }
    const existeduser = await shopkeeper.findOne({username})
    if(existeduser){
        throw new ApiError(409,"User with this username Exist Previously")
    }
    const user = await shopkeeper.create({
        fullname,
        username,
        phNo,
        email : email || "",
        shopName,
        location,
        upiId,
        password
    })
    if(!user){
        throw new ApiError(409,"Something went Wrong while creating creation account...")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Account create successfully...")
    )
})

const shopkeeperLogin = AsyncHandeler(async(req,res)=>{
    const { username, phNo, password } = req.body
    if(!username || !phNo || !password){
        throw new ApiError(404,"All fields are required...")
    }
    const user = await shopkeeper.findOne({
        $or : [{phNo},{username}]
    })
    if(!user){
        throw new ApiError(404,"User doesnot exist...")
    }
    const PasswordCorrect = await shopkeeper.isPasswordCorrect(password);
    if(!PasswordCorrect){
        throw new ApiError(404,"incorrect password...");
    }
    const {accessToken,refreshToken} = generateAccessAndRefreshToken(user._id);
    const loggedinUser = await shopkeeper.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,{user : loggedinUser,accessToken,refreshToken},"Logged in Successfully...")
    )
})

const logoutShopKeeper = AsyncHandeler(async(req,res) =>{
    await shopkeeper.findByIdAndUpdate(
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

const changeLocation = AsyncHandeler(async(req,res)=>{
    const { newLocation } = req.body 
    const updatedDetails = await shopkeeper.findByIdAndUpdate([
        req.user._id,
        {
            $set : {
                location : newLocation
            }
        },
        {
            new : true
        }
    ])
    if(!updatedDetails){
        throw new ApiError(401,"Something went wrong while update the location details...")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,updatedDetails,"Location update successfully...")
    )
})

const regenerateShopKeeperAccessAndRefreshToken = AsyncHandeler(async(req,res)=>{
    const incommingrefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if(!incommingrefreshToken){
        throw new ApiError(401,"User not authenticated...")
    }
    try{
        const decodedAccessToken = jwt.verify(
            incommingrefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const ShopkeeperUser = await shopkeeper.findById(decodedAccessToken?._id);
        if(!ShopkeeperUser){
            throw new ApiError(401,"User details are not found")
        }
        if(incommingrefreshToken != ShopkeeperUser?.refreshToken){
            throw new ApiError(401,"refreshToken is expired or used...")
        }
        const {newAccessToken,newRefreshToken} = generateAccessAndRefreshToken(ShopkeeperUser._id);
        const option = {
            httpOnly : true,
            secure : true
        }
        return res
        .status(200)
        .cookie("accessToken",newAccessToken)
        .cookie("refreshToken",newRefreshToken)
        .json(
            new ApiResponse(200,{
                accessToken : newAccessToken,
                refreshToken : newRefreshToken
            },"Access and Refresh Tokens are refreshed successfully...")
        )
    }catch(error){
        throw new ApiError(400,error?.message || "Invalid refresh Token")
    }
})

const changePhNo = AsyncHandeler(async(req,res)=>{
    const {newPhNo} = req.body
    if(!newPhNo){
        throw new ApiError(404,"Please fill the current field...")
    }
    await shopkeeper.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                phNo : newPhNo
            }
        },
        {
            new : true
        }
    )
    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Phone number updated successfully...")
    )
})

export {
    registerShopkeeper,
    shopkeeperLogin,
    logoutShopKeeper,
    changeLocation,
    regenerateShopKeeperAccessAndRefreshToken,
    changePhNo
}
