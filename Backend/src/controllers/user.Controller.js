import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.Model.js"
import { ApiResponse } from "../utils/ApiResponse.js"



const registerUser= asyncHandler(async (req, res) =>{
    // get user details from frontend
    //validation -empty
    //check if user already exits :email
    // create user object -create entry in db
    //remove password and refresh token field from response
    //check for user creation 
    //return res 

   const {name,email,password,Role} = req.body
   console.log("email:",email)

   if ([name,email,password,Role].some((field) => field.trim?.trim()==="")) {
        throw new ApiError(400,"All fields are required")
   }
   // email validator 
   if(!email.includes("@")){
    throw new ApiError(400,"Invalid email address")
   }

   const existeuser = await User.findOne({
        $or:[{email}]
   })

   if(existeuser){
    throw new ApiError(409,"User Already Exist")
   }


   const user = await User.create({
        name:name.toLowerCase(),
        email,
        password,
        Role,
   })

   const createdUser =await User.findById(user._id).select(
    "-password -refreshToken"
   )

   if(!createdUser){
    throw new ApiError(500,"Something went wrong while registering a user")
   }

   return res
   .status(201)
   .json( new ApiResponse(200,createdUser,"User registered  Successfully"));


})



export  {registerUser}
