import { Request, Response } from "express";
import { pool } from "../../config/postgres";
import crypto from "crypto";
import { Compte } from "../../types/Compte";

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

    console.log("user authenticated:", {
      id: user.id,
      mail: user.mail,
      nom: user.nom,
      prenom: user.prenom,
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
    return res.status(500).json({ message: "Server error" });
  }
};

const validateUserCredentials = async (
  email: string,
  password: string,
): Promise<Compte | null> => {
  const result = await pool.query(
    "SELECT * FROM fredouil.compte WHERE mail = $1",
    [email],
  );
  if (result.rows.length === 0) {
    return null;
  }

  const user: Compte = result.rows[0];

  if (sha1(password) !== user.motpasse) {
    return null;
  }

  return user;
};

const sha1 = (password: string): string => {
  return crypto.createHash("sha1").update(password).digest("hex");
};
