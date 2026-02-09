import { Request, Response, NextFunction } from "express";

/**
 * Middleware de gestion des erreurs pour l'application Express.
 * Capture les erreurs, les logue et renvoie une réponse JSON avec un message d'erreur.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error(err);

  res.status(500).json({
    message: err.message || "Erreur interne du serveur",
  });
};
