import { Router } from "express";
import {loginUser, logoutUser, registerUser} from './../controllers/user.Controller.js';
import { verifyJWT } from './../middlewares/auth.Middleware';

const router = Router();

router.route("/register").post(registerUser);

router.route("/Login").post(loginUser);

//secure routes
router.route("/Logout").post(verifyJWT,logoutUser);
export default router; 
