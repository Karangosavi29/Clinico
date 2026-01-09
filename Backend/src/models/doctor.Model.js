import mongoose from "mongoose";

const doctorSchema =new mongoose.Schema({
    doctorid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    specialization:{
        type:String,
        required:true
    },
    experience:{
        type:Number,
        default:0,

    }
},{timestamps:true})


export const Doctor =mongoose.model("doctor",doctorSchema)