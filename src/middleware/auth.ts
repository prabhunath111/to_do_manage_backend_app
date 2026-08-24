import { Response, NextFunction } from "express";
import { AuthRequest, Role } from "../types";
import { verifyToken } from "../utils/jwt";

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
  const token = header.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, invalid or expired token" });
  }
};

export const requireRole = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: requires role(s) ${roles.join(", ")}`,
      });
    }
    next();
  };
};
