import { Router } from "express";
import {getallUser, loginUser, logoutUser, refreshAccessToken, registerUser} from './../controllers/user.Controller.js';
import { verifyJWT } from './../middlewares/auth.Middleware.js';
import { roleMiddleware } from "../middlewares/role.Middleware.js";

const router = Router();

router.route("/register").post(registerUser);

router.route("/Login").post(loginUser);

//secure routes
router.route("/Logout").post(verifyJWT,logoutUser);
router.route("/refresh-token").post(refreshAccessToken);


router.route("/admin/users").get(
    verifyJWT,                   // Must be logged in
    roleMiddleware("admin")        // Must be admin
    ,getallUser)                     // Controller that returns users
export default router; 
