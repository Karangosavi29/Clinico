import express from "express"
import cors from "cors"
import cookieparser from "cookie-parser"
const app =express()

app.use(cors({
    origin: [
        "https://clinico-gamma.vercel.app",
        "http://localhost:5173",
        "http://localhost:5174"
    ],
    credentials: true
}));

app.use(express.json({limit:"16kb"})) //json data limit

app.use(express.urlencoded({extended:true,limit:"16kb"})) //url encoded data 

app.use(express.static("public")) //to serve static files

app.use(cookieparser()) //to parse cookies

// Routes import 
import userRouter from "./routes/user.Route.js"
import doctorRouter from "./routes/doctor.Route.js"
import appointmentRouter from "./routes/appointment.Route.js"
import reviewRouter from "./routes/review.Route.js"

// route declaration 
app.use("/api/v1/users", userRouter)
app.use("/api/v1/doctors", doctorRouter)
app.use("/api/v1/appointments", appointmentRouter)
app.use("/api/v1/reviews", reviewRouter)

// ---- ADD THIS: centralized JSON error handler ----
// Must be defined AFTER all routes, and must have exactly 4 params
// so Express recognizes it as an error-handling middleware.
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    console.error("Error caught by global handler:", err);

    return res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        errors: err.errors || [],
        // stack trace only in dev, never expose in production
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
});

export { app }