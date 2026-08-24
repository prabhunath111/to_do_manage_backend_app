import jwt, { SignOptions } from "jsonwebtoken";
import { JwtPayload } from "../types";

const SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN } as SignOptions);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, SECRET) as JwtPayload;
};
