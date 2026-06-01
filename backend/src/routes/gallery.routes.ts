import { Router } from "express";
import {
  getGallery,
  searchSnippets,
  trendingSnippets
} from "../controllers/gallery.controller.js";

const router = Router();

router.route("/").get(getGallery);
router.route("/search").get(searchSnippets);
router.route("/trending").get(trendingSnippets);

export default router;
