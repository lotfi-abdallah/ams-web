import { Router } from "express";
import {
  loginUser,
  logoutUser,
  getMe,
  listConnectedUsers,
} from "./auth.controllers";
import { requireAuth } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/login", loginUser);
router.post("/logout", requireAuth, logoutUser);
router.get("/me", requireAuth, getMe);
router.get("/connected-users", requireAuth, listConnectedUsers);

export default router;
