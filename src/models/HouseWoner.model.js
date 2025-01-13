import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const WonerSchema = new Schema(
    {
        fullname : {
            type : String,
            required : true,
            trim : true,
            index : true
        },
        username : {
            type : String,
            required : true,
            trim : true,
            lowercase : true,
            email : true
        },
        PhNo : {
            type : Number,
            required : true,
        },
        email : {
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true
        },
        avatar : {
            type : String,
        },
        PaymentMode : {
            type : String,
            required : true,
            trim : true
        },
        UpiId : {
            type : String
        },
        Scanner : {
            type : String
        },
        Address : {
            type : String,
            required : true,
            trim : true
        },
        HouseNo : {
            type : Number,
            required : true
        },
        password : {
            type : String,
            required : true
        },
        refreshToken : {
            type : String
        }
    }
)

WonerSchema.pre("save",async function (next) {
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

WonerSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}

WonerSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id : this._id,
            email : this.email,
            fullname : this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

WonerSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id : this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const HouseWoner = mongoose.model("HouseWoner",WonerSchema)