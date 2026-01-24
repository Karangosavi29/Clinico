import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.Middleware.js";
import { roleMiddleware } from "../middlewares/role.Middleware.js";
import { bookAppointment, cancelAppointment, updateAppointment, viewAppointment } from "../controllers/Appointment.Controller.js";


const router=Router();

//patient can book appointment
router.route("/").post(verifyJWT,roleMiddleware("patient"),bookAppointment)
//get appointment
router.route("/").get(verifyJWT,viewAppointment)
//update appointment
router.route("/:id").put(verifyJWT,updateAppointment)
//cancel
router.route("/:id").patch(verifyJWT,cancelAppointment)

export default router;