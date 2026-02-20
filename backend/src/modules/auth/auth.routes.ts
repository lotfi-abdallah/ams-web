import { Router } from "express";
import { loginUser } from "./auth.controllers";

const router = Router();

router.post("/login", loginUser);

export default router;
