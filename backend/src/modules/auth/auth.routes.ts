import { Router } from "express";
import { loginUser, logoutUser, getMe } from "./auth.controllers";

const router = Router();

router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", getMe);

export default router;
