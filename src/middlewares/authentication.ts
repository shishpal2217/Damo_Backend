import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import { config } from "../config/config";

export interface AuthRequest extends Request {
  userId: string;
}

const auth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization") as string;
  if (!token) {
    return next(createHttpError(401, "No token, authorization denied"));
  }

  const parseToken = token.split(" ")[1];
  if (!parseToken) {
    return next(createHttpError(401, "No token, authorization denied"));
  }

  try {
    const decoded = jwt.verify(parseToken, config.jwtSecret as string);
    const _req = req as AuthRequest;
    _req.userId = decoded.sub as string;
  } catch (error) {
    return next(createHttpError(401, "Invalid token"));
  }

  next();
};

export default auth;
