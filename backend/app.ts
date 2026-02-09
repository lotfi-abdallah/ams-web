import express from "express";
import { errorHandler } from "./src/middlewares/error.middleware";
import homeRoutes from "./src/modules/home/home.routes";
import authRoutes from "./src/modules/auth/auth.routes";

/**
 * Initialisation de l'application Express.
 */
export const app = express();

/**
 * Configuration des middlewares pour l'application Express.
 * - express.urlencoded: pour parser les données de formulaire.
 * - express.json: pour parser les données JSON dans les requêtes.
 */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// routes
// app.use("/", homeRoutes);
// app.use("/", authRoutes);

app.use(express.static("../frontend/dist/frontend/browser"));
app.get("/*rest", (req, res) => {
  res.sendFile("index.html", { root: "../frontend/dist/frontend/browser" });
});

// Érreurs middleware
app.use(errorHandler);
