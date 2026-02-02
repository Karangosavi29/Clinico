import { Doctor } from "../models/doctor.Model.js";
import { User } from "../models/user.Model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Appointment } from '../models/appointment.Model.js';
import { asyncHandler } from "../utils/asyncHandler.js";




// Book create Appointment
const bookAppointment =  asyncHandler(async(req,res) =>{

    
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
    
         // Convert date to day of week
          const dayOfWeek = new Date(date).toLocaleString("en-US", { weekday: "long" });

        // Find doctor availability for that day
         const dayAvailability = doctor.availability.find(d => d.day === dayOfWeek);
         if (!dayAvailability) {
             throw new ApiError(400, `Doctor is not available on ${dayOfWeek}.`);
        }

        // Check if the requested timeSlot exists
        if (!dayAvailability.slots.includes(timeSlot)) {
            throw new ApiError(400, `Doctor is not available at ${timeSlot} on ${dayOfWeek}.`);
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
    
    
});

//View read Appointments 
const viewAppointment =asyncHandler(async(req,res)=>{
    //1 Ensure Authentication Middleware
    //2 Define Filtering Rules
    //3 Implement Conditional Query Logic


    const userId=req.user._id
    const role=req.user.role

    let filter={}

    switch(role){
        case "patient":
            filter.patientId=userId;
            break;
        
        case "doctor":
            filter.doctorId=userId;
            break;

        case "admin" :
            // Admin sees all appointments, no filter
            break;

        default:
            throw new ApiError(403,"Accese Denied");
    }

    //query filter
    if(req.query.status){
        filter.status=req.query.status;
    }
    if(req.query.date){
        filter.date=new Date(req.query.date);
    }

    //Pagination

    const limit= Math.min(Number(req.query.limit)||20,100);  //Default limit: 20 items per page (max 100 to prevent abuse)
    const page= Number(req.query.page) ||1;          //defaults to 1 if not provided
    const skip= (page-1)*limit;                      

    const appointments = await Appointment.find(filter)
        .populate("patientId","name email role")         //populate replace the ID with the actual document.
        .populate({ path: "doctorId", model: Doctor, select: "name specialization" })
        .sort({date:1,timeSlot:1})
        .skip(skip)
        .limit(limit)
        .lean();

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Appointments fetched successfully",appointments)
    )
    
})

const updateAppointment =asyncHandler(async(req,res)=>{
    //1 Validate Request
    //2 Fetch Appointment
    //3 Role-Based Access & Field Restrictions
    //4 Save Appointment


    const appointmentId =req.params.id;
    const {role,_id:userId}=req.user;  //req.user contains authenticated user's _id and role.
    const {date,timeSlot,notes,status}=req.body;

    //Fetch Appointment
    const appointment = await Appointment.findById(appointmentId)
    if(!appointment){
        throw new ApiError(404,"Appointment not found")
    }

    //Role-Based Access
    if(role =="patient"){   
        if(appointment.patientId.toString() !== userId.toString()){
            throw new ApiError(403,"you can only update your Own Appointment")
        }

        if(appointment.status !== "booked"){
            throw new ApiError(400,"Only booked appointment can be Updated")
        }
        //updating the date, check if the current timeSlot is still valid
        if(date){
            appointment.date = new Date(date);

            const doctor = await Doctor.findById(appointment.doctorId);
            const dayOfWeek = appointment.date.toLocaleString("en-US", { weekday: "long" });
            const dayAvailability = doctor.availability.find(d => d.day === dayOfWeek);

            if(!dayAvailability || !dayAvailability.slots.includes(appointment.timeSlot)){
                throw new ApiError(400, `Current timeSlot is not available on the new date (${dayOfWeek})`);
            }
        }


        if(timeSlot) {
        const doctor = await Doctor.findById(appointment.doctorId);

        // Get day of week for the appointment
        const dayOfWeek = new Date(appointment.date).toLocaleString("en-US", { weekday: "long" });

        // Find availability for that day
        const dayAvailability = doctor.availability.find(d => d.day === dayOfWeek);
        if (!dayAvailability) {
          throw new ApiError(400, `Doctor is not available on ${dayOfWeek}`);
        }

        // Check if requested timeSlot exists
        if (!dayAvailability.slots.includes(timeSlot)) {
             throw new ApiError(400, `Doctor is not available at ${timeSlot} on ${dayOfWeek}`);
        }

        // Ensure conflict check uses full day
        const conflictStart = new Date(appointment.date);
        conflictStart.setHours(0, 0, 0, 0);

        const conflictEnd = new Date(appointment.date);
        conflictEnd.setHours(23, 59, 59, 999);

        const conflict = await Appointment.findOne({
             _id: { $ne: appointmentId },
            doctorId: appointment.doctorId,
            date: { $gte: conflictStart, $lte: conflictEnd },
            timeSlot,
            status: "booked"
        });

        if(conflict) throw new ApiError(400, "Time slot already booked");

        appointment.timeSlot = timeSlot; 


        
    }
        if(notes){
            appointment.notes=notes;
        }
    }

    if(role =="doctor"){
        if(appointment.doctorId.toString() !== userId.toString()){
            throw new ApiError(403,"You can only update your assigned appointments")
        }
        if (status) appointment.status = status; // e.g., completed, cancelled
    }

    //Admin updates: validate availability + conflict
    if(role == "admin"){
        if(date) appointment.date = new Date(date);

        const doctor = await Doctor.findById(appointment.doctorId);
        const dayOfWeek = new Date(appointment.date).toLocaleString("en-US", { weekday: "long" });
        const dayAvailability = doctor.availability.find(d => d.day === dayOfWeek);

        if(timeSlot){
            if(!dayAvailability || !dayAvailability.slots.includes(timeSlot)){
               throw new ApiError(400, `Doctor is not available at ${timeSlot} on ${dayOfWeek}`);
            }

            // Conflict check for admin
            const conflictStart = new Date(appointment.date);
            conflictStart.setHours(0,0,0,0);
            const conflictEnd = new Date(appointment.date);
            conflictEnd.setHours(23,59,59,999);

            const conflict = await Appointment.findOne({
                _id: { $ne: appointmentId },
                doctorId: appointment.doctorId,
                date: { $gte: conflictStart, $lte: conflictEnd },
                timeSlot,
                status: "booked"
            });
            if(conflict) throw new ApiError(400, "Time slot already booked");

            appointment.timeSlot = timeSlot;
        }

        if(notes) appointment.notes = notes;
        if(status) appointment.status = status;
    }


    //Save Appointment
    await appointment.save();

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Appointment updated Successfully",appointment)
    )

})

const cancelAppointment =asyncHandler(async (req, res) => {
    // validate request
    //fetch appointment
    //role based access
    //status check
    //update appointment
    //return response

    const appointmentId =req.params.id;
    const {role,_id:userId}=req.user;

    const appointment =await Appointment.findById(appointmentId)
    if(!appointment){
        throw new ApiError(404,"Appointment not found")
    }

    if(role =="patient" && appointment.patientId.toString() !==userId.toString()){
        throw new ApiError(403,"you can only cancel Your own Appointment")
    }

    if(role =="doctor" && appointment.doctorId.toString() !== userId.toString()){
        throw new ApiError(403,"you can only cancel your assigned appointment")
    }


    if(appointment.status !== "booked"){
        throw new ApiError(400,"Only booked appointments can be cancelled")
    }

    appointment.status= "cancelled";
    await appointment.save();

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Appointment cancelled successfully",appointment)
    )



})

//  endpoint for doctor to update availability
const updateAvailability = asyncHandler(async (req, res) => {
    const { availability } = req.body; // [{ day: "Monday", slots: ["10:00","11:00"] }]
    const doctorId = req.user._id;

    const doctor = await Doctor.findById(doctorId);
    if(!doctor) throw new ApiError(404,"Doctor not found");

    doctor.availability = availability;
    await doctor.save();

    return res.status(200).json(new ApiResponse(200,"Availability updated", doctor));
});


export {
    bookAppointment,
    viewAppointment,
    updateAppointment,
    cancelAppointment,
    updateAvailability
}