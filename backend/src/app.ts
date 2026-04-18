import express from "express";
import path from "path";
import { errorHandler } from "./middlewares/error.middleware";
import authRoutes from "./modules/auth/auth.routes";
import postRoutes from "./modules/posts/posts.routes";
import { createMongoSessionStore, session } from "./config/mongodb";
import { env } from "./config/env";

/**
 * Initialisation de l'application Express.
 */
export const app = express();
const store = createMongoSessionStore();

/**
 * Configuration des middlewares pour l'application Express.
 * - express.urlencoded: pour parser les données de formulaire.
 * - express.json: pour parser les données JSON dans les requêtes.
 * - cors: pour permettre les requêtes cross-origin depuis le frontend.
 *
 */
app.use(
  session({
    secret: env.mongodb.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      secure: env.nodeEnv === "production", // because you are using HTTPS
      httpOnly: true,
      maxAge: 1000 * 60 * 60, // 1 hour
    },
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// routes
// app.use("/", homeRoutes);
// app.use("/", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

const staticDir = __dirname;
app.use(express.static(staticDir));
app.get("/*rest", (req, res) => {
  res.sendFile(path.join(staticDir, "index.html"));
});
// Auth routes

// Érreurs middleware
app.use(errorHandler);
