import mongoose,{Schema} from "mongoose";

const starReviewSchema = new Schema(
    {
        star : {
            type : Number
        },
        comment : {
            type : String
        },
        product : {
            type : Schema.Types.ObjectId,
            ref : "Product"
        },
        givenBy : {
            type : Schema.Types.ObjectId,
            ref : "User"
        }
    },
    {
        timestamps : true
    }
)

export const starReview = mongoose.model("StarReview",starReviewSchema);