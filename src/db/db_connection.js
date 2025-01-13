import mongoose from "mongoose";
import DB_NAME from "../constants.js"

const DBconnection=(async ()=>{
    try {
        const connect=await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log("Mongodb is connected succesfully !!! Host : ",connect.connection.host);
    } catch (error) {
        console.log("MONGODB connection error : ",error);
        process.exit(1);
    }
})

export default DBconnection;