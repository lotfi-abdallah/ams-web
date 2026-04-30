import { Router } from "express";
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
  unlikePost,
  deleteComment,
  sharePost,
} from "./posts.controllers";
import { requireAuth } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", getPosts);
router.get("/:id", getPostById);
router.post("/", requireAuth, createPost);
router.put("/:id", requireAuth, updatePost);
router.delete("/:id", requireAuth, deletePost);
router.post("/:id/like", requireAuth, likePost);
router.post("/:id/unlike", requireAuth, unlikePost);
router.post("/:id/comment", requireAuth, addComment);
router.delete("/:id/comment/:commentId", requireAuth, deleteComment);
router.post("/:id/share", requireAuth, sharePost);

export default router;
