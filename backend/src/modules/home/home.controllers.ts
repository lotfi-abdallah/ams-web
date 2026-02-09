import { Request, Response } from "express";

/**
 * Contrôleur pour la page d'accueil de l'application.
 * Envoie le fichier index.html situé dans le répertoire src/modules/home
 */
export const getHomePage = (_req: Request, res: Response) => {
  res.sendFile("index.html", { root: "src/modules/home" });
};
