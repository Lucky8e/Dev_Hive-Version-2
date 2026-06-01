import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import {
  getSnippetReviews,
  streamReview
} from "../controllers/review.controller.js";

const router = Router();

router.route("/stream").post(verifyJwt, streamReview);
router.route("/:snippetId").get(verifyJwt, getSnippetReviews);

export default router;
