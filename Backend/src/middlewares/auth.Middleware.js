import { User } from "../models/user.Model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import  jwt from 'jsonwebtoken';




export const verifyJWT =asyncHandler(async (req,_ ,next) =>{   //next use for next work 
         try {
            const Token = req.cookies?.accessToken  || req.header("Authorization")?.replace("Bearer", "")
   
            if (!Token) {
                throw new ApiError(401,"Unauthorized request")
            } 
   
           const decodedToken =  jwt.verify(Token,process.env.ACCESS_TOKEN_SECRET)
   
           const user = await User.findById(decodedToken?._id).select(" -password -refreshToken")
   
           if(!user){
   
               throw new ApiError(401, "Invalid access Token")
           }
   
           req.user =user;
           next()
         } catch (error) {
                throw new ApiError(401 ,error?.message || "Invalid access Token")
         }
         
})  