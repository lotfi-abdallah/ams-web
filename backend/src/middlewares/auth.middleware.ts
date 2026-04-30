import { Request, Response, NextFunction } from "express";

/**
 * Middleware d'authentification.
 * Vérifie qu'une session utilisateur valide existe.
 * Renvoie 401 sinon. Sinon, passe à la suite.
 */
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.session?.user?.id) {
    return res.status(401).json({ message: "Utilisateur non authentifié." });
  }
  return next();
};
