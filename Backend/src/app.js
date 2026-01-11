import express from "express"
import cors from "cors"
import cookieparser from "cookie-parser"
const app =express()

app.use(cors({  //for what you allow
    origin:process.env.CORS_ORIGIN,
    credentials:true
    
}))

app.use(express.json({limit:"16kb"})) //json data limit

app.use(express.urlencoded({extended:true,limit:"16kb"})) //url encoded data 

app.use(express.static("public")) //to serve static files

app.use(cookieparser()) //to parse cookies


//Routes import 
import router from "./routes/user.Route.js"


//route declaration 
// https://localhost:8000/api/v1/users/register

app.use("/api/v1/users",router)




export {app}