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

/**
 * Configuration des routes pour l'application Express.
 * - homeRoutes: routes liées à la page d'accueil.
 * - authRoutes: routes liées à l'authentification.
 */
app.use("/", homeRoutes);
app.use("/", authRoutes);
/**
 * Configuration du middleware de gestion des erreurs pour l'application Express.
 */
app.use(errorHandler);
