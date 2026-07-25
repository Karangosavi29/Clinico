import mongoose from "mongoose";


const appointmentSchema = new mongoose.Schema({
    patientId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    doctorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    date:{
        type:Date,
        required:true
    },
    timeSlot:{
        type:String,
        required:true
    },
    status:{
        type:String,
        enum:["pending","approved","cancelled","completed"],
        default:"pending"
    },
    meetingLink:{
        type:String,
        default:null
    },
    notes:{   //Useful for prescriptions, remarks, or patient info
        type:String,
    }


},{timestamps:true})

export const Appointment =mongoose.model("appointment",appointmentSchema)