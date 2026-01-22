import { Appointment } from "../models/appointment.Model";
import { Doctor } from "../models/doctor.Model";
import { User } from "../models/user.Model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { Appointment } from '../models/appointment.Model';




// Book a new appointment
const bookAppointment = async(req,res,next) =>{

    try {
        const {doctorId,date,timeSlot,notes} =req.body
        const userid =req.user._id;
    
        //Check if user is a patient
        const user =await User.findById(userid);
        if(!user ||user.role!== "patient"){
            throw new ApiError(403,"Only patients can book Appointment.")
        }
    
        //check if doctor is exist
        const doctor =await Doctor.findById(doctorId);
        if(!doctor){
            throw new ApiError(404,"Doctor not Found")
        }
    
        //check if doctor  is Available on time
        if (!doctor.availability.includes(timeSlot.trim())) {
            throw new ApiError(400, "Doctor is not available at the selected time.");
        }

    
        //prevent overlaping appointments Prevent slot conflicts
        const existingAppointment =await Appointment.findOne({
            doctorId,
            date:new Date(date),
            timeSlot,
            status:"booked",
        });
    
        if(existingAppointment){
            throw new ApiError(400,"Time slot Already Booked")
        }
    
        //create Appointment
        const appointment = new Appointment({
            patientId : userid,
            doctorId,
            date:new Date(date),
            timeSlot,
            notes,
        })
    
    
        await appointment.save();
        return res
        .status(201)
        .json(
            new ApiResponse(201,"Appointment booked Succesfully ",appointment)
        )
    
    } catch (error) {
            next(error);

    }
}


export {
    bookAppointment
}