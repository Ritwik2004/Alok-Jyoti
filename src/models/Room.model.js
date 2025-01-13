import mongoose,{Schema} from "mongoose";

const RoomSchema = new Schema(
    {
        roomType : {
            type : String,
            required : true
        },
        flore : {
            type : Number,
            required : true
        },
        noOfStudints : {
            type : Number,
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
        image3 : {
            type : String,
            required : true
        },
        feature : {
            type : String,
            required : true
        },
        rent : {
            type : Number,
            required : true
        },
        downPayment : {
            type : Number,
            required : true
        },
        avaliable : {
            type : Boolean,
            required : true
        },
        owner : {
            type : Schema.Types.ObjectId,
            ref : "HouseWoner"
        }
    },
    {
        timestamps : true
    }
)

export const Room = mongoose.model("Room",RoomSchema);