import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import {
  getMe,
  loginUser,
  logoutUser,
  refresh,
  registerUser
} from "../controllers/auth.controller.js";

const router = Router();

router.route("/registerUser").post(registerUser);
router.route("/loginUser").post(loginUser);
router.route("/logoutUser").post(verifyJwt, logoutUser);
router.route("/refresh").post(refresh);
router.route("/getMe").get(verifyJwt, getMe);

export default router;
