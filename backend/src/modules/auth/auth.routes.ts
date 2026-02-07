import { Router } from "express";
import { loginUser } from "./auth.controllers";

const router = Router();

router.get("/login", loginUser);

export default router;
