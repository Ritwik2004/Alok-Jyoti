import mongoose,{Schema} from "mongoose";
import { uploadCloudinary } from "../utils/uploadCloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandeler } from "../utils/asyncHandeler";
import { product } from "../models/product.model.js";
import { starReview } from "../models/productStarAndReview.model.js";

const uploadProduct = AsyncHandeler(async(req,res)=>{
    const { productName, price, details, deliveryDate,avaliable } = req.body
    if(!productName || !price || !details || !deliveryDate || !avaliable){
        throw new ApiError(404,"All fields are required...")
    }
    const image1LocalPath = req.files?.image1[0].path
    const image2LocalPath = req.files?.image2[0].path
    if(!image1LocalPath || !image2LocalPath){
        throw new ApiError(404,"Images of the product is must required...")
    }
    const image1 = await uploadCloudinary(image1LocalPath)
    const image2 = await uploadCloudinary(image2LocalPath)
    if(!image1){
        throw new ApiError(401,"Something went wrong while uploading the first image of the product in cloudinary...")
    }
    if(!image2){
        throw new ApiError(401,"Something went wrong while uploading the second image of the product in cloudinary...")
    }

    const productCreation = await product.create(
        {
            productName,
            image1 : image1.url,
            image2 : image2.url,
            price,
            details,
            deliveryDate,
            owner : req.user._id,
            avaliable
        }
    )
    if(!productCreation){
        throw new ApiError(401,"Something went wrong in the time of uploading...")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,productCreation,"Product upload successfully with its data...")
    )
})

const viewProduct = AsyncHandeler(async(req,res)=>{
    const productId = req.params;
    if(!productId){
        throw new ApiError(404,"Product not found...")
    }
    const productDetails = await product.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(productId)
            }
        },
        {
            $lookup : {
                from : "starReviews",
                localField : "_id",
                foreignField : "product",
                as : "AllReviews",
            }
        },
        {
            $addFields : {
                reviewCount : {
                    $size : "$AllReviews"
                },
                avgStar : {
                    $avg: "$AllReviews.star" 
                },
                reviews: {
                    $map: {
                      input: "$AllReviews", 
                      as: "reviewDoc", 
                      in: "$$reviewDoc.comment" 
                    }
                }
            }
        },
        {
            $project : {
                reviewCount : 1,
                avgStar : 1,
                reviews : 1,
                image1 : 1,
                image2 : 1,
                productName : 1,
                price : 1,
                details : 1,
                deliveryDate : 1,
                avaliable : 1
            }
        }
    ])
    if(! productDetails?.length){
        throw new ApiError("401","Something went wrong in pipeline...")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,productDetails[0],"Products data are fetched successfully...")
    )
})

const ChangeDeleveryDate = AsyncHandeler(async(req,res)=>{
    const productId = req.params
    const new_deliveryDate = req.body
    const Product = await product.findById(productId)
    if(Product.owner != req.user._id){
        throw new ApiError(401,"Its seems like you are not the woner of this product...")
    }
    const updatedDetails = await product.findByIdAndUpdate(
        productId,
        {
            $set : {
                deliveryDate : new_deliveryDate
            }
        },
        {
            new : true
        }
    )
    if(!updatedDetails){
        throw new ApiError(401,"Something went wrong while updateing delivery date of this product...")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,updatedDetails,"Delevery date is updated successfully...")
    )
})

const changePrice = AsyncHandeler(async(req,res)=>{
    const productId = req.params
    const newPrice = req.body
    const Product = await product.findById(productId)
    if(Product.owner != req.user._id){
        throw new ApiError(401,"It seems like you are not the owner of this product...")
    }
    const updatedDetails = await product.findByIdAndUpdate(
        productId,
        {
            $set : {
                price : newPrice
            }
        },
        {
            new : true
        }
    )
    return res
    .status(200)
    .json(
        new ApiResponse(200,updatedDetails,"Price for this product is updated successfully...")
    )
}) 

const changeAvaliability = AsyncHandeler(async(req,res)=>{
    const {status} = req.body
    const productId = req.params
    if(!productId){
        throw new ApiError(401,"Product not found...")
    }
    const ProductDetails = await product.findById(productId)
    if(ProductDetails.owner != req.user._id){
        throw new ApiError(401,"Its seems like you are not the woner of this product...")
    }
    const updatedDetails =  await product.findByIdAndUpdate(
        productId,
        {
            $set : {
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
        new ApiResponse(200,updatedDetails,"Avaliable status is updated successfully...")
    )
})

const starAndReview = AsyncHandeler(async(req,res)=>{
    const { star, comment } = req.body
    const productId = req.params
    const givenBy = req.user._id
    const previouslyexist = await starReview.findOne({
        $and : [
            {
                product : productId
            },
            {
                givenBy
            }
        ]
    })
    if(previouslyexist){
        await starAndReview.findByIdAndUpdate(
            previouslyexist._id,
            {
                $set : {
                    star,
                    comment
                }
            },
            {
                new : true
            }
        )
    }
    else{
        const createReview = starAndReview.create({
            star,
            comment,
            product : productId,
            givenBy
        })
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Review updated successfully...")
    )

})

export {
    uploadProduct,
    viewProduct,
    ChangeDeleveryDate,
    changePrice,
    changeAvaliability,
    starAndReview
}