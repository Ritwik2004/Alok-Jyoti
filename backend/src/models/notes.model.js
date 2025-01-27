import mongoose,{Schema} from "mongoose";

const notesSchema = new Schema(
    {
        notesFile : {
            type : String,
            require : true
        },
        title : {
            type : String,
            required : true
        },
        description : {
            type : String,
            required : true
        },
        author : {
            type : String,
            required : true
        },
        sem : {
            type : Number,
            required : true
        },
        subject : {
            type : String,
            required : true
        },
        woner : {
            type : Schema.Types.ObjectId,
            ref : "User"
        }
    },
    {
        timestamps : true
    }
)




export const Notes = mongoose.model("Note",notesSchema);