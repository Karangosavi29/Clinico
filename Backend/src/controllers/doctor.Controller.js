import { Doctor } from "../models/doctor.Model.js";
import { User } from "../models/user.Model.js";
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
      .json(new ApiResponse(201, "Doctor created", doctor));
  
});

const getallDoctor =asyncHandler(async(req ,res ) => {
    
        //Fetch all doctor records from the database
        const doctors =await Doctor.find().populate("userId","name email role")  //Populate the user info for each doctor
        return res
        .status(200)
        .json(
            new ApiResponse(200, "Doctors retrieved successfully", doctors)
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
         new ApiResponse(200,"Doctor are getIt",doctor)
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
            new ApiResponse(200,"Doctor Updated Succesfully",doctor)
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
            new ApiResponse(200,"Doctor delete Succesfully")
        )
    
});

export {
    createDoctor,
    getallDoctor,
    getSingleDoctor,
    updateDoctor,
    deleteDoctor
}