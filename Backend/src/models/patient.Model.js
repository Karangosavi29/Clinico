import mongoose, { Types } from "mongoose";


const patientSchema =new mongoose.Schema({
    patientid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true
    },
    dateOfBirth:{
        type:Date,
        required:true,
    },
    gender:{
        type:String,
        enum:["Male","Female","other"],
        required:true
    },
    medicalHistory:{
        type:string,
        default:""
    }
},{timestamps:true})



export const Patient =mongoose.model("patient", patientSchema)