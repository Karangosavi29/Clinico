import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.Middleware.js";
import { roleMiddleware } from "../middlewares/role.Middleware.js";
import {createDoctor, deleteDoctor, getallDoctor, getAvailability, getDoctorStats, getSingleDoctor, updateAvailability} from "../controllers/doctor.Controller.js"
const router =Router();


// Admin-only route to create a doctor
router.route("/").post(verifyJWT,roleMiddleware("admin"),createDoctor)

// Public routes to get doctors
router.route("/").get(getallDoctor)
router.route("/:id").get(getSingleDoctor)

// Admin-only routes to update/delete a doctor
router.route("/:id").put(verifyJWT,roleMiddleware("admin"),updateDoctor)
router.route("/:id").delete(verifyJWT,roleMiddleware("admin"),deleteDoctor)


//Availability routes doctor
router.route("/:id/availability").put(verifyJWT,roleMiddleware("doctor"),updateAvailability)
router.route("/:id/availability").get(getAvailability)

//doctor dashboards
router.route("/dashboard").get(verifyJWT,roleMiddleware("doctor"),getDoctorStats)
router.route("/dashboard").get(verifyJWT, roleMiddleware("doctor"), getDoctorDashboard);
export default router;