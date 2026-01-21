import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.Middleware.js";
import { roleMiddleware } from "../middlewares/role.Middleware.js";
import {createDoctor, deleteDoctor, getallDoctor, getSingleDoctor, updateDoctor} from "../controllers/doctor.Controller.js"
const router =Router();


// Admin-only route to create a doctor
router.route("/").post(verifyJWT,roleMiddleware("admin"),createDoctor)

// Public routes to get doctors
router.route("/").get(getallDoctor)
router.route("/:id").get(getSingleDoctor)

// Admin-only routes to update/delete a doctor
router.route("/:id").put(verifyJWT,roleMiddleware("admin"),updateDoctor)
router.route("/:id").delete(verifyJWT,roleMiddleware("admin"),deleteDoctor)

export default router;