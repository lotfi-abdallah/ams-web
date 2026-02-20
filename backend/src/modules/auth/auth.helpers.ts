import { pool } from "../../config/postgres";
import crypto from "crypto";
import { Compte } from "../../types/Compte";

export const validateUserCredentials = async (
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

export const sha1 = (password: string): string => {
  return crypto.createHash("sha1").update(password).digest("hex");
};

export const updateConnectionStatus = async (
  userId: number,
  isConnected: 1 | 0,
): Promise<boolean> => {
  try {
    await pool.query(
      "UPDATE fredouil.compte SET isconnected = $1 WHERE id = $2",
      [isConnected, userId],
    );
    return true;
  } catch (error) {
    console.error("Error updating connection status:", error);
    return false;
  }
};
