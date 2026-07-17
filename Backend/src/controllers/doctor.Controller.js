import { Doctor } from "../models/doctor.Model.js";
import { User } from "../models/user.Model.js";
import {Review} from "../models/review.Model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


 const createDoctor = asyncHandler(async (req, res) => {
  
    const { userId, specialization, experience, availability } = req.body;

    // Validate input
    if (!userId || !specialization || !availability) {
      throw new ApiError(400, "All fields are required");
    }



    //  Check if user exists
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");



    //  Check if already a doctor
    const existingDoctor = await Doctor.findOne({ userId });
    if (existingDoctor) throw new ApiError(400, "User is already a doctor");



    //  Create doctor
    const doctor = await Doctor.create({
      userId,
      specialization,
      experience,
      availability,
    });




    //  Upgrade user role
    user.role = "doctor";
    await user.save();

    //  Return success
    return res
      .status(201)
      .json(new ApiResponse(201, doctor, "Doctor created"));
  
});

const getallDoctor =asyncHandler(async(req ,res ) => {
    
        //Fetch all doctor records from the database
        let  doctors =await Doctor.find().populate("userId","name email role")  //Populate the user info for each doctor
        
         // Fetch reviews for all doctors
        const doctorIds = doctors.map(d => d._id);
        const reviews = await Review.aggregate([
            { $match: { doctorId: { $in: doctorIds } } },
            { $group: { _id: "$doctorId", avgRating: { $avg: "$rating" }, reviewCount: { $sum: 1 } } }
        ]);

        // Map reviews to doctors
        doctors = doctors.map(doc => {
            const reviewData = reviews.find(r => r._id.toString() === doc._id.toString());
            return {
                ...doc.toObject(),
                avgRating: reviewData ? reviewData.avgRating : 0,
                reviewCount: reviewData ? reviewData.reviewCount : 0
            };
        });

        return res
        .status(200)
        .json(
            new ApiResponse(200, doctors, "Doctors retrieved successfully")
        )
    

});

const getSingleDoctor =asyncHandler(async (req, res ,next) => {
   try {
     //Fetch  doctor records from the database
     const doctor =await Doctor.findById(req.params.id).populate("userId","name email role")
 
     if(!doctor){
         throw new ApiError(404,"Doctor not found")
     }
 
     return res
     .status(200)
     .json(
         new ApiResponse(200, doctor, "Doctor fetched successfully")
     )
   } catch (error) {
        next(error)
   }
});

const updateDoctor =asyncHandler(async (req,res) =>{

        //Fetch  doctor records from the database
        const doctor= await  Doctor.findByIdAndUpdate(req.params.id,req.body,{new:true})
    
        if(!doctor){
            throw new ApiError(404,"Doctor not found ")
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(200, doctor, "Doctor updated successfully")
        )

});


const deleteDoctor =asyncHandler(async (req,res ) => {
    
    
        const doctor =await Doctor.findById(req.params.id)
        if(!doctor){
            throw new ApiError(404,"Doctor not found")
        }
    
        await Doctor.findByIdAndDelete(req.params.id)
    
         // Downgrade the user role back to patient
        await User.findByIdAndUpdate(doctor.userId,{role:"patient"})
    
        return res
        .status(200)
        .json(
            new ApiResponse(200, null, "Doctor deleted successfully")
        )
    
});

// Doctor updates their availability
const updateAvailability = asyncHandler(async (req, res) => {
    const { availability } = req.body; // [{ day: "Monday", slots: ["10:00","11:00"] }]
    const doctorId = req.user._id;

    const doctor = await Doctor.findById(doctorId);
    if(!doctor) throw new ApiError(404,"Doctor not found");

    doctor.availability = availability;
    await doctor.save();

    return res.status(200).json(new ApiResponse(200, doctor, "Availability updated"));
});

// Optionally, a GET endpoint to read availability
const getAvailability = asyncHandler(async (req, res) => {
    const doctorId = req.params.id;
    const doctor = await Doctor.findById(doctorId).select("availability");
    if(!doctor) throw new ApiError(404,"Doctor not found");

    return res
    .status(200)
    .json(new ApiResponse(200, doctor.availability, "Availability fetched"));
});

// Doctor Dashboard (number of appointments, completed visits, etc)
const getDoctorStats = asyncHandler(async (req, res) => {
    const doctorId = req.user._id; // Doctor must be authenticated

    // Fetch all appointments for this doctor
    const appointments = await Appointment.find({ doctorId });

    if (!appointments) throw new ApiError(404, "No appointments found");

    // Calculate stats
    const totalAppointments = appointments.length;
    const booked = appointments.filter(a => a.status === "booked").length;
    const completed = appointments.filter(a => a.status === "completed").length;
    const cancelled = appointments.filter(a => a.status === "cancelled").length;

    const today = new Date();
    const upcoming = appointments.filter(a => a.status === "booked" && a.date >= today).length;

    // unique patients
    const patientsSet = new Set(appointments.map(a => a.patientId.toString()));
    const uniquePatients = patientsSet.size;

    return res
    .status(200)
    .json(new ApiResponse(200, {
        totalAppointments,
        booked,
        completed,
        cancelled,
        upcoming,
        uniquePatients
    }, "Doctor stats fetched"));
});

// Dashboard (today/upcoming/completed)
const getDoctorDashboard = asyncHandler(async (req, res) => {
    const doctorId = req.user._id;
    const filter = req.query.filter; // today, upcoming, completed
    let query = { doctorId };

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    if (filter === "today") query.date = { $gte: todayStart, $lte: todayEnd };
    if (filter === "upcoming") query.date = { $gt: todayEnd };
    if (filter === "completed") query.status = "completed";

    const appointments = await Appointment.find(query)
        .populate("patientId", "name email")
        .sort({ date: 1, timeSlot: 1 });

    return res.status(200).json(
        new ApiResponse(200, appointments, "Doctor dashboard fetched")
    );
});



export {
    createDoctor,
    getallDoctor,
    getSingleDoctor,
    updateDoctor,
    deleteDoctor,
    updateAvailability,
    getAvailability,
    getDoctorStats,
    getDoctorDashboard
}