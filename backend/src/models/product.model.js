import mongoose,{Schema} from "mongoose";
import { type } from "os";

const productSchema = new Schema(
    {
        productName : {
            type : String,
            required : true
        },
        image1 : {
            type : String,
            required : true
        },
        image2 : {
            type : String,
            required : true
        },
        price : {
            type : String,
            required : true
        },
        details : {
            type : String,
            required : true
        },
        avaliable : {
            type : Boolean,
            required : true
        },
        review : [
            {
                type : Schema.Types.ObjectId,
                ref : "starReview"
            }
        ],
        deliveryDate : {
            type : Date
        },
        owner : {
            type : Schema.Types.ObjectId,
            ref : "ShopKeeper"
        }
    },
    {
        timestamps : true
    }
)

export const product = mongoose.model("Product",productSchema);