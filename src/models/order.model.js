import { request } from "express";
import mongoose,{Schema, Types} from "mongoose";

const Order = new Schema(
    {
        customerName : {
            type : String,
            required : true
        },
        customerPhNo : {
            type : Number,
            required : true
        },
        customerEmailId : {
            type : String
        },
        quantity : {
            type : Number,
            required : true
        },
        payment : {
            type : String,
            required : true
        },
        customerAddress : {
            type : String,
            required : true
        },
        pinCode : {
            type : Number,
            required : true
        },
        CustomerId : {
            type : Schema.Types.ObjectId,
            ref : "User"
        },
        ownerId : {
            type : Schema.Types.ObjectId,
            ref : "shopkeeper"
        },
        productId : {
            type : Schema.Types.ObjectId,
            ref : "product"
        }
    },
    {
        timestamps : true
    }
)

export const order = mongoose.model("Order",Order);