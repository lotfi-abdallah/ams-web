import express from "express";
import { errorHandler } from "./src/middlewares/error.middleware";
import homeRoutes from "./src/modules/home/home.routes";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";

export const app = express();

// middlewares
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// routes
app.use("/", homeRoutes);
// Érreurs middleware
app.use(errorHandler);
