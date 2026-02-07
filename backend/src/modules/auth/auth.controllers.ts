import { Request, Response } from "express";

export const loginUser = (req: Request, res: Response) => {
  console.log(req.query);
  res.redirect("/");
};
