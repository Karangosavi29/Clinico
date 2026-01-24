import mongoose from "mongoose";

const doctorSchema =new mongoose.Schema({
    userId:{
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

    },
    availability:[
        {
            day: {
                type: String,  // e.g., "Monday", "Tuesday"
                required: true
            },
            slots: [
                {
                    type: String, // e.g., "10:00", "14:30"
                    required: true
                }
            ]
        }
    ]
},{timestamps:true})


export const Doctor =mongoose.model("doctor",doctorSchema)