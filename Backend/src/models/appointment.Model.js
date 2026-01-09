import mongoose from "mongoose";


const appointmentSchema = new mongoose.Schema({
    appointmentId:{
        type:mongoose.Schema.Types.ObjectId,
         ref: "User",
        required: true
    },
    patientid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    doctorid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    date:{
        type:Date,
        required:true
    },
    timeslot:{
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