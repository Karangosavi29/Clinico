import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.Model.js"
import { ApiResponse } from "../utils/ApiResponse.js"


const generateAccessTokenAndRefreshTokens = async(userId) =>{
     try {
          const user =await User.findById(userId)
          const accessToken =user.generateAccessToken()
          const refreshToken =user.generateRefreshToken()

          user.refreshToken =refreshToken
          await user.save({validateBeforesave :false})

          return {accessToken,refreshToken}


     } catch (error) {
          throw new ApiError(500,"Something went wrong while generating Access and refresh toKen")
     }
}

const registerUser= asyncHandler(async (req, res) =>{
    // get user details from frontend
    //validation -empty
    //check if user already exits :email
    // create user object -create entry in db
    //remove password and refresh token field from response
    //check for user creation 
    //return res 

   const {name,email,password,role} = req.body
   console.log("email:",email)

   if ([name, email, password, role].some(field => !field || String(field).trim() === "")) {
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
        role,
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

const loginUser =asyncHandler( async (req ,res) => {
     //req body -- data
     //email
     //find the user
     //password check
     //access and refresh Token
     //send in cookie

     const {email,password} =req.body


     if(!email ){
          throw new ApiError(400,"Email  is required")
     }

     const user =await User.findOne({email})

     if(!user){
          throw new ApiError(404,"User does not exist")
     }

     const isPasswordvalid =await user.isPasswordCorrect(password)

     if(!isPasswordvalid){
          throw new ApiError(404,"Invalid user credentials")
     }

     const {accessToken,refreshToken} = await generateAccessTokenAndRefreshTokens(user._id)

     const loggedInUser =await User.findById(user._id)
     select("-password -refreshToken")


     const options ={
          httpOnly :true,
          secure:true
     }

     return res
     .status(200)
     .cookie("accessToken", accessToken,options)
     .cookie("refreshToken", refreshToken, options)
     .json(
          new ApiResponse(200,
               {
                    user:loggedInUser ,accessToken,
                    refreshToken
               },
               "user Logged In Succesfully"

          )
     )


})



export  {registerUser,
         loginUser 
}
