import{Router} from "express";
import { verifyJWT } from "../middlewares/auth.Middleware";
import { roleMiddleware } from "../middlewares/role.Middleware";
import { addReview } from "../controllers/review.Controller";


const router=Router();

//patient add/update review
router.route("/").post(verifyJWT,roleMiddleware("patient"),addReview)



// Get reviews for a doctor
router.route("/:id").get(getDoctorReviews);

export default router;