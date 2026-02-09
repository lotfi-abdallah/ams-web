import { Request, Response } from "express";
import { pool } from "../../config/postgres";

export const getHomePage = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT NOW() AS current_time");
    console.log("Database query result:", result);
  } catch (error) {
    console.error("Error executing query:", error);
  }
  res.sendFile("index.html", { root: "src/modules/home" });
};
