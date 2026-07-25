import{Router} from "express";
import { verifyJWT } from "../middlewares/auth.Middleware.js";
import { roleMiddleware } from "../middlewares/role.Middleware.js";
import { addReview, getDoctorReviews, getTestimonials } from "../controllers/review.Controller.js";


const router=Router();

// Get testimonials (must come before /:id)
router.route("/testimonials").get(getTestimonials);

//patient add/update review
router.route("/").post(verifyJWT,roleMiddleware("patient"),addReview)

// Get reviews for a doctor
router.route("/:id").get(getDoctorReviews);

export default router;