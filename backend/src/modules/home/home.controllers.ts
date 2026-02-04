import { Request, Response } from "express";

export const getHomePage = (_req: Request, res: Response) => {
  res.sendFile("index.html", { root: "src/modules/home" });
};
