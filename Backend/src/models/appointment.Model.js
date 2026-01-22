import mongoose from "mongoose";
import { appointment } from './appointment.Model';


const appointmentSchema = new mongoose.Schema({
    appointmentId:{
        type:mongoose.Schema.Types.ObjectId,
         ref: "User",
        required: true
    },
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
        type:string,
        required:true
    },
    status:{
        type:string,
        enum:["booked","cancelled","completed"],
        default:"booked"
    },
    notes:{   //Useful for prescriptions, remarks, or patient info
        type:string,
    }


},{timestamps:true})

export const Appointment =mongoose.model("appointment",appointmentSchema)