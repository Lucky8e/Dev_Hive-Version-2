import { Router } from "express";
import { runCode } from "../controllers/execution.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/run").post(verifyJwt, runCode);

export default router;
