import mongoose from "mongoose";
import {DB_NAME} from"../constants.js"


const connectDb = async ()=>{
    try {
        const connectionInstance =await mongoose.connect
        (`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB Host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("mongoDB connection Error",error);
        process.exit(1)
    }
}



export {connectDb}