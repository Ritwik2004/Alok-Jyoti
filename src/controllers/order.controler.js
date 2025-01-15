import { AsyncHandeler } from "../utils/asyncHandeler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { shopkeeper } from "../models/shopkeeper.model.js";
import { product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import { order } from "../models/order.model.js";
import { sendMail } from "../utils/mailSend.js";
import { json } from "express";

const productOrder = AsyncHandeler(async(req,res)=>{
    const {customerName, customerPhNo, customerEmailId, quantity, payment, customerAddress, pinCode } = req.body
    if(!customerName || !customerPhNo || !quantity || !payment || customerAddress || !pinCode){
        throw new ApiError(404,"All fields are required!")
    }
    const userId = req.user._id
    if(!userId){
        throw new ApiError(401,"Something Went Wrong...")
    }
    const user = await User.findById(userId)
    if(!user){
        throw new ApiError(401,"Unauthorized request!")
    }
    const productId = req.params;
    if(!productId){
        throw new ApiError(401,"Invalid Product!")
    }
    const ProductDetails = await product.findById(productId);
    if(!ProductDetails){
        throw new ApiError(401,"Product not found!")
    }
    const orderCreation = await order.create(
        {
            customerName,
            customerAddress,
            customerPhNo,
            customerEmailId : customerEmailId || "",
            quantity,
            payment,
            pinCode,
            CustomerId : user._id,
            productId : ProductDetails._id,
            ownerId : ProductDetails.owner
        }
    )
    if(!orderCreation){
        throw new ApiError(401,"Something went when ordere is create...");
    }
    const findShop = await shopkeeper.findById(ProductDetails.owner)
    const orderData = await order.findById(orderCreation._id).select("-ownerId -CustomerId")
    const orderMail = await sendMail(findShop.email, orderData, "New Order")
    if(!orderMail){
        throw new ApiError(400,"problem time of sending order throw mail to the shope keeper...")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,orderData,"successfully order this product...")
    )
})

export {
    productOrder
}