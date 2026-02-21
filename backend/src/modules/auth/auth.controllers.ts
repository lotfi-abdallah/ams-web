import { Request, Response } from "express";
import {
  updateConnectionStatus,
  validateUserCredentials,
} from "./auth.helpers";

/**
 * Contrôleur pour la connexion de l'utilisateur.
 * Actuellement, il redirige simplement vers la page d'accueil après logger
 * les paramètres de la requête (username, password, etc.) pour le développement.
 */
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await validateUserCredentials(email, password);

    if (!user) {
      console.log("no user found with email:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isUpdated = await updateConnectionStatus(user.id, 1);

    if (!isUpdated) {
      console.log("Failed to update connection status for user:", user.id);
      return res
        .status(500)
        .json({ message: "Failed to update connection status" });
    }

    req.session.user = { id: user.id, mail: user.mail };

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        mail: user.mail,
        nom: user.nom,
        prenom: user.prenom,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  if (!req.session || !req.session.user || !req.session.user.id) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const userId = req.session.user.id;

  try {
    const isUpdated = await updateConnectionStatus(userId, 0);

    if (!isUpdated) {
      console.log("Failed to update connection status for user:", userId);
      return res
        .status(500)
        .json({ message: "Failed to update connection status" });
    }

    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ message: "Failed to log out" });
      }
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logout successful" });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getMe = (req: Request, res: Response) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  return res.status(200).json({ user: req.session.user });
};
