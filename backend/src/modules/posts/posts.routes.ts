import { Router } from "express";
import {
  getPosts,
  getPostById,
  createPost,
  likePost,
  addComment,
  unlikePost,
  deleteComment,
} from "./posts.controllers";

const router = Router();

router.get("/", getPosts);
router.get("/:id", getPostById);
router.post("/", createPost);
router.post("/:id/like", likePost);
router.post("/:id/unlike", unlikePost);
router.post("/:id/comment", addComment);
router.delete("/:id/comment/:commentId", deleteComment);

export default router;
