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
            status: { $in: ["pending", "approved"] },
        });
    
        if(appointment.status !== "pending" && appointment.status !== "approved"){
            throw new ApiError(400,"Only pending or approved appointments can be updated")
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
            new ApiResponse(201, appointment, "Appointment booked successfully")
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
        new ApiResponse(200, appointments, "Appointments fetched successfully")
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
        if (status) {
            const allowedStatuses = ["completed", "cancelled"];
            if (!allowedStatuses.includes(status)) {
                throw new ApiError(400, `Doctors can only set status to: ${allowedStatuses.join(", ")}`);
            }
            appointment.status = status;
        }
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
        new ApiResponse(200, appointment, "Appointment updated successfully")
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
        new ApiResponse(200, appointment, "Appointment cancelled successfully")
    )



})

const rescheduleAppointment =asyncHandler(async(req,res) =>{
    //Validate Request
    //Fetch Appointment
    //Role-Based Access
    //Business Logic / Validation
    //Check doctor availability
    // Check for conflicts
    //Update / Save Appointment
    // Return Response

    const appointmentId = req.params.id;
    const { date, timeSlot } = req.body;
    const { role, _id: userId } = req.user;

    const appointment = await Appointment.findById(appointmentId);
      if (!appointment) throw new ApiError(404, "Appointment not found");

    // Only patient or admin
    if(role === "patient" && appointment.patientId.toString() !== userId.toString()){
        throw new ApiError(403,"you can reshedule your appointment")
    }

    if(appointment.status !=="approved" && appointment.status !=="pending"){
        throw new ApiError(400,"only pending or approved appointment can be rescheduled")
    }

    //Availability + conflict check (reuse your logic)
    const doctor = await Doctor.findById(appointment.doctorId);
    const newDate = new Date(date);
    const dayOfWeek = newDate.toLocaleString("en-US", { weekday: "long" });

    const dayAvailability = doctor.availability.find(d => d.day === dayOfWeek);
    if (!dayAvailability || !dayAvailability.slots.includes(timeSlot)) {
        throw new ApiError(400, "Doctor not available at selected time");
    }

    const conflict = await Appointment.findOne({
        _id: { $ne: appointmentId },
        doctorId: appointment.doctorId,
        date: newDate,
        timeSlot,
        status: { $in: ["pending", "approved"] }
    });

    if (conflict) throw new ApiError(400, "Time slot already booked");

    appointment.date = newDate;
    appointment.timeSlot = timeSlot;

    await appointment.save();

    return res
        .status(200)
        .json(new ApiResponse(200, appointment, "Appointment rescheduled successfully")
    );
})

const approveAppointment = asyncHandler(async (req, res) => {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) throw new ApiError(404, "Appointment not found");
    if (appointment.status !== "pending") throw new ApiError(400, "Only pending appointments can be approved");

    appointment.status = "approved";

    // Auto-generate a video call link if one doesn't already exist
    if (!appointment.meetingLink) {
        const roomName = `clinico-${appointment._id}`;
        appointment.meetingLink = `https://meet.jit.si/${roomName}`;
    }

    await appointment.save();

    return res.status(200).json(new ApiResponse(200, appointment, "Appointment approved"));
});

const cancelAppointmentAdmin = asyncHandler(async (req, res) => {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) throw new ApiError(404, "Appointment not found");
    if (appointment.status === "cancelled") throw new ApiError(400, "Already cancelled");
    if(role =="doctor"){
        const doctorRecord = await Doctor.findOne({ userId });
        if (!doctorRecord || appointment.doctorId.toString() !== doctorRecord._id.toString()) {
            throw new ApiError(403,"you can only cancel your assigned appointment")
        }
    }
    appointment.status = "cancelled";
    await appointment.save();

    return res.status(200).json(new ApiResponse(200, appointment, "Appointment cancelled"));
});





export {
    bookAppointment,
    viewAppointment,
    updateAppointment,
    cancelAppointment,
    rescheduleAppointment,
    approveAppointment,
    cancelAppointmentAdmin
    
}