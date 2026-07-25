import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.Middleware.js";
import { roleMiddleware } from "../middlewares/role.Middleware.js";
import { approveAppointment, bookAppointment, cancelAppointment, rescheduleAppointment, updateAppointment, viewAppointment } from "../controllers/Appointment.Controller.js";


const router=Router();

//patient can book appointment
router.route("/").post(verifyJWT,roleMiddleware("patient"),bookAppointment)
//get appointment
router.route("/").get(verifyJWT,viewAppointment)
//update appointment
router.route("/:id").put(verifyJWT,updateAppointment)
//cancel
router.route("/:id").patch(verifyJWT,cancelAppointment)
//reschedule
router.route("/:id/reschedule").post(verifyJWT,roleMiddleware("patient", "admin"),rescheduleAppointment)



//admin
router.route("/:id/approve").post(verifyJWT,roleMiddleware("doctor","admin"),approveAppointment)
router.route("/admin/:id/cancel").post(verifyJWT,roleMiddleware("admin"),cancelAppointment)
export default router;