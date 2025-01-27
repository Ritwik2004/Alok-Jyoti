import { ApiError } from "../utils/ApiError.js";
import { AsyncHandeler } from "../utils/asyncHandeler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const verifyJWT = AsyncHandeler(async(req,res,next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
        if(!token){
            throw new ApiError(401,"Unauthorised request...");
        }
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id).select("-password -refreshToken");
        if(!user){
            throw new ApiError(401,"Invalid AccessToken...")
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(400,error.message || "Invalid AccessToken...");
    }
})