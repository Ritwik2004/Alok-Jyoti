import DBconnection from "./db/db_connection.js"
import app from "./app.js"
import dotenv from "dotenv"
dotenv.config({
    path: "./env"
})

DBconnection()
.then(()=>{
    app.listen(process.env.PORT || 3000,(err)=>{
        if(err){
            console.log("App listen is failed !!!");
        }
        else{
            console.log("App is listen on port : ",process.env.PORT)
        }
    })
})
.catch((err)=>{
    console.log("Mongodeb connection fail !!!");
})