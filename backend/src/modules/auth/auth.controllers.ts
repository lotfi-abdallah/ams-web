import { Request, Response } from "express";

/**
 * Contrôleur pour la connexion de l'utilisateur.
 * Actuellement, il redirige simplement vers la page d'accueil après logger
 * les paramètres de la requête (username, password, etc.) pour le développement.
 */
export const loginUser = (req: Request, res: Response) => {
  console.log("Username: " + req.query.username);
  console.log("Password: " + req.query.password);
  res.redirect("/");
};
