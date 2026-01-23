import { Doctor } from "../models/doctor.Model";
import { User } from "../models/user.Model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { Appointment } from '../models/appointment.Model';
import { asyncHandler } from "../utils/asyncHandler";




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
        .populate("patientId","name email")         //populate replace the ID with the actual document.
        .populate("doctorId","name specialization")
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
        if(date)appointment.date=new Date(date);

        if(timeSlot){
            const doctor =await Doctor.findById(appointment.doctorId)
            if(!doctor.availability.includes(timeSlot)){
                throw new ApiError(400,"Doctor is not Availble at the selected time ")
            }

           const existing= await Appointment.findOne({
                doctorId:appointment.doctorId,
                date:new Date(date || appointment.date),
                timeSlot,
                status:"booked",
                _id:{$ne:appointment._id},

           })

           if(existing){
                throw new ApiError(400,"Time slot Already Booked")
           }

           appointment.timeSlot =timeSlot;
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

    if(role == "admin"){
        if(date) appointment.date=new Date(date);
        if(timeSlot) appointment.timeSlot=timeSlot;
        if(notes) appointment.notes=notes;
        if(status) appointment.status=status;
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


export {
    bookAppointment,
    viewAppointment,
    updateAppointment,
    cancelAppointment
}