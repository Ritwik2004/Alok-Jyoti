import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const shopkeeperSchema = new Schema(
    {
        fullname : {
            type : String,
            required : true
        },
        username : {
            type : String,
            required : true
        },
        phNo : {
            type : Number,
            required : true
        },
        email : {
            type : String
        },
        shopName : {
            type : String,
            required : true
        },
        location : {
            type : String,
            required : true
        },
        upiId : {
            type : String
        },
        password : {
            type : String,
            required : true
        },
        refreshToken : {
            type : String,
            required : true
        }
    }
)

shopkeeperSchema.pre("save",async function (next) {
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,10)
    next()    
})

shopkeeperSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}

shopkeeperSchema.methods.generateAccessToken = function(){
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

shopkeeperSchema.methods.generateRefreshToken = function(){
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

export const shopkeeper = mongoose.model("ShopKeeper",shopkeeperSchema)