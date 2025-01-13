import mongoose, { Schema } from "mongoose";

const favourit = new Schema(
    {
        // things : [
        //     {
        //         type : Schema.Types.ObjectId,
        //         ref : "Product"
        //     }
        // ],
        // rooms : [
        //     {
        //         type : Schema.Types.ObjectId,
        //         ref : "Room"
        //     }
        // ],
        notes : [
            {
                type : Schema.Types.ObjectId,
                ref : "Notes"
            }
        ],
        savedBy : {
            type : Schema.Types.ObjectId,
            ref : "User"
        }
    },
    {
        timestamps : true
    }
)
export const AddFeverite = mongoose.model("FavouriteNotes",favourit)