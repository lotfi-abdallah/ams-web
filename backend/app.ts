import express from "express";
import { errorHandler } from "./src/middlewares/error.middleware";
import homeRoutes from "./src/modules/home/home.routes";
import authRoutes from "./src/modules/auth/auth.routes";

export const app = express();

// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// routes
app.use("/", homeRoutes);
app.use("/", authRoutes);
// Érreurs middleware
app.use(errorHandler);
