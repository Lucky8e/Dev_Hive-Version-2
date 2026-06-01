import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import {
  createSnippet,
  getMyCodeSnippets,
  getCodeSnippetsByShortcode,
  updateSnippet,
  deleteSnippet,
  forkSnippet,
  toggleLike
} from "../controllers/snippet.controller.js";

const router = Router();

//protected routes
router.route("/").post(verifyJwt, createSnippet);
router.route("/my").get(verifyJwt, getMyCodeSnippets);
router.route("/:id").patch(verifyJwt, updateSnippet);
router.route("/:id").delete(verifyJwt, deleteSnippet);
router.route("/:id/like").post(verifyJwt, toggleLike);
router.route("/fork/:shortCode").post(verifyJwt, forkSnippet);

//public routes
router.get("/s/:shortCode", getCodeSnippetsByShortcode);

export default router;
