import { AsyncHandeler } from "../utils/asyncHandeler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/uploadCloudinary.js";
import  jwt from "jsonwebtoken";
import { application } from "express";
import { HouseWoner } from "../models/HouseWoner.model.js";


const generateAccessAndRefreshToken = (async(userId)=>{
    try {
       const user = await User.findById(userId);
       const accessToken = user.generateAccessToken();
       const refreshToken = user.generateRefreshToken();
       user.refreshToken = refreshToken;
       await user.save({validateBeforeSave: false});
       return {accessToken,refreshToken};
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh token and access token")
    }
})

const registerUser = AsyncHandeler(async(req,res) => {
//(workd without avatar and coverImage that means photos are not uploaded)



    //process :
    //1. get data
    //2. validation 
    //3. check if previously exist or not
    //4. check if avatar is given or not
    //5. upload avatar on cloudinary
    //6. create user object
    //7. remove password and token
    //8. check user is created or not
    //9. return response

//1. get data

// console.log("coming in register route")

    const {fullname,email,username,gender,age,department,semister,batch,password} = req.body;

// console.log("req.body is accepted...")
// console.log(fullname)
// console.log(email)
// console.log(username)
// console.log(gender)
// console.log(age)
// console.log(department)
// console.log(semister)
// console.log(batch)

//2. validation
    
    if(
        [fullname,email,username,password,gender,department,semister,batch].some((field)=>{
            field?.trim()==""
        })
    ){
        throw new ApiError(400,"'Name','email','username,'password','gender','department','semister','batch' are must required");
    }

    if(!fullname){
                throw new ApiError(400,"Name is must required");
    }
    if(!email){
                throw new ApiError(400,"Name is must required");
    }
    if(!username){
                throw new ApiError(400,"username is must required");
    }
    if(!password){
                throw new ApiError(400,"password is must required");
    }
    if(!gender){
                throw new ApiError(400,"gender is must required");
    }
    if(!department){
                throw new ApiError(400,"department is must required");
    }
    if(!semister){
                throw new ApiError(400,"sem is must required");
    }
    if(!batch){
                throw new ApiError(400,"batch is must required");
    }

    // console.log("field checking is successfully..")

//3. check if previously exist or not

    const userFind = await User.findOne({
        $or: [{ username },{ email }]
    })

    if(userFind){
        throw new ApiError(401,"User with same email or uername is previously exist...");
    }

    console.log("User is avaliable or not check successfully!!!")

    //4. check avatar is given or not

    const avatarLocalPath = req.files?.avatar[0]?.path;

    // console.log("Aproved for avatar...")

    //5. upload avatar on cloudinary
    let Avatar;
    if(avatarLocalPath){
        Avatar = await uploadCloudinary(avatarLocalPath);
    }

    // console.log("avatar checking is successfully...")

    //6. create user object
    const createUser = User.create({
        username : username,
        email,
        fullname,
        gender,
        age : age || 0,
        department,
        semister,
        batch,
        password,
        avatar : Avatar?.url || ""
    })

// check if user is successfully created or not

    if(!createUser){
        throw new ApiError(401,"Something went wrong when create new user...")
    }
console.log("User create successfully...")

//7. Remove password,token from response

    const user = await User.findById(await createUser._id).select(
        "-password -refreshToken"
    )

//8. return response

    return res.status(200).json(
        new ApiResponse(200,user,"User registered successfully...")
    )
})

const loginUser = AsyncHandeler(async(req,res)=>{
    //req body -> data
    //verify user by username or emailId
    //check password
    //generate accessToken and refreshToken
    //send them by using cookies

// 1. req body ->data
    const {email, username, password} = req.body;
    console.log("username : ",username);
// 2. verify user by username or email 
    if(!username || !email){
        throw new ApiError(400,"username or email is required");
    }
    const user = await User.findOne({
        $or: [{username},{email}]
    })
    if(!user){
        throw new ApiError(404,"User does not exist");
    }
// 3. check password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(404,"Invalid user creadentials !!!");
    }
// 4. generate accesstoken and refreshtoken by using "generateAccessAndRefreshToken()" function
    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id);
//hide refresh token and password from user
    const loggedinUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly : true,
        secure : true
    }
// 5. send them to the user
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedinUser, accessToken, refreshToken
            },
            "user loggedin successfully !!!"
        )
    );
})

const logoutUser = AsyncHandeler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken : undefined
            }
        },
        {
            new : true
        }
    )
    const option ={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie("accessToken",option)
    .clearCookie("refreshToken",option)
    .json(new ApiResponse(200, {}, "User logged out successfully !!!"))
})

const refreshAccessToken = AsyncHandeler(async(req,res)=>{
    const incommingrefreshToken = req.cookies.refreshAccessToken || req.body.refreshToken;
    if(!incommingrefreshToken){
        throw new ApiError(401,"refresh token unavailable...");
    }
    try {
        const decodedAccessToken = jwt.verify(
            incommingrefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedAccessToken?._id);
        if(!user){
            throw new ApiError(401,"invalid refreshToken...");
        }
        if(incommingrefreshToken != user?.refreshToken){
            throw new ApiError(401,"refreshToken is expired or used")
        }
        const {newAccessToken,newRefreshToken} = generateAccessAndRefreshToken(user._id);
        const option = {
            httpOnly : true,
            secure : true
        }
    
        return res
        .status(200)
        .cookie("accessToken",newAccessToken,option)
        .cookie("refreshToken",newRefreshToken,option)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken : newAccessToken,
                    refreshToken : newRefreshToken
                },
                "Access Token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(400,error?.message || "Invalid refresh Token")
    }
})

const changePassword = AsyncHandeler(async(req,res)=>{
    const { oldPassword, newPassword, email, username } = req.body;
    if(!oldPassword || !newPassword || !email || !username){
        throw new ApiError(401,"All fields are required...");
    }
    const user = await User.findOne({
        $or : [{username},{email}]
    })
    if(!user){
        throw new ApiError(401,"emailId or username is not registered...");
    }
    const isPasswordValid = await user.isPasswordCorrect(oldPassword);
    if(!isPasswordValid)
    {
        throw new ApiError(401,"Enter correct Password...");
    }
    user.password = newPassword;
    user.save({validateBeforeSave : false})
    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password changed successfully..."));

})

const updateAvatar = AsyncHandeler(async(req,res)=>{
    const avatarLocalPath = req.files?.avatar[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(402,"Avatar file required...");
    }
    const avatar = await uploadCloudinary(avatarLocalPath);
    if(!avatar.url){
        throw new ApiError(401,"Error while uploading in to cloudinary...");
    }
    const user = await User.findByIdAndUpdate(
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
        new ApiResponse(200,user,"Avatar update successfully...")
    )
})

const updateAccountDetails = AsyncHandeler(async(req,res)=>{
    const {email, fullname, age, semister} = req.body;
    if(!email || !fullname || !age || !semister){
        throw new ApiError(401,"All  filds is required...");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                email,
                fullname,
                age,
                semister
            }
        },
        {
            new : true
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"'email','name','age','semister' is successfully updated...")
    )
})

const getCurrentUser = AsyncHandeler(async(req,res)=>{
    return res
    .status(200)
    .json(
        new ApiResponse(200,req.user,"Current user fetched successfully...")
    )
})

const getHouseWoner = AsyncHandeler(async(req,res)=>{
    const {username} = req.params?.trim()
    if(!username){
        throw new ApiError(400,"username is mising...")
    }
    const details = await HouseWoner.aggregate([
            {
                $match : {
                    username : username
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

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    updateAvatar,
    updateAccountDetails,
    getCurrentUser,
    getHouseWoner
}