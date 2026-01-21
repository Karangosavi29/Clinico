import mongoose from "mongoose";

const doctorSchema =new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    specialization:{
        type:String,
        required:true
    },
    experience:{
        type:Number,
        default:0,

    },
    availability: {
    type: [String],
    required: true
}

},{timestamps:true})


export const Doctor =mongoose.model("doctor",doctorSchema)