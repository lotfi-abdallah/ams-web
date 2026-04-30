import { Router } from "express";
import { loginUser, logoutUser, getMe } from "./auth.controllers";
import { requireAuth } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/login", loginUser);
router.post("/logout", requireAuth, logoutUser);
router.get("/me", requireAuth, getMe);

export default router;
