import { Router } from "express";
import { getHomePage } from "./home.controllers";

const router = Router();

router.get("/", getHomePage);

export default router;
