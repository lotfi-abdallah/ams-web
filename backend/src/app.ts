import express from "express";
import path from "path";
import { errorHandler } from "./middlewares/error.middleware";
import authRoutes from "./modules/auth/auth.routes";
import postRoutes from "./modules/posts/posts.routes";
import { sessionMiddleware } from "./config/session";

/**
 * Initialisation de l'application Express.
 */
export const app = express();

/**
 * Configuration des middlewares pour l'application Express.
 * - sessionMiddleware: pour gérer les sessions utilisateur avec MongoDB.
 * - express.urlencoded: pour parser les données de formulaire.
 * - express.json: pour parser les données JSON dans les requêtes.
 */
app.use(sessionMiddleware);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

const staticDir = __dirname;
app.use(express.static(staticDir));
app.get("/*rest", (req, res) => {
  res.sendFile(path.join(staticDir, "index.html"));
});

// Érreurs middleware
app.use(errorHandler);
