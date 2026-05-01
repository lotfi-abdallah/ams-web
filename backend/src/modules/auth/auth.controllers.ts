import { Request, Response } from "express";
import {
  getConnectedUsers,
  updateConnectionStatus,
  validateUserCredentials,
} from "./auth.helpers";
import { getSocket } from "../../config/socket";

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
      return res
        .status(401)
        .json({ message: "Email ou mot de passe invalide." });
    }

    const isUpdated = await updateConnectionStatus(user.id, 1);

    if (!isUpdated) {
      console.log("Failed to update connection status for user:", user.id);
      return res
        .status(500)
        .json({
          message: "Impossible de mettre à jour le statut de connexion.",
        });
    }

    req.session.user = {
      id: user.id,
      email: user.mail,
      username: user.pseudo,
    };

    getSocket().emit("user:connected", {
      id: user.id,
      pseudo: user.pseudo,
      nom: user.nom,
      prenom: user.prenom,
      avatar: user.avatar,
    });

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
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  const userId = req.session.user!.id;
  const pseudo = req.session.user!.username;

  try {
    const isUpdated = await updateConnectionStatus(userId, 0);

    if (!isUpdated) {
      console.log("Failed to update connection status for user:", userId);
      return res
        .status(500)
        .json({
          message: "Impossible de mettre à jour le statut de connexion.",
        });
    }

    getSocket().emit("user:disconnected", { id: userId, pseudo });

    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ message: "Échec de la déconnexion." });
      }
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Déconnexion réussie." });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

export const getMe = (req: Request, res: Response) => {
  return res.status(200).json({ user: req.session.user });
};

export const listConnectedUsers = async (_req: Request, res: Response) => {
  try {
    const users = await getConnectedUsers();
    return res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};
