import { Request, Response } from "express";
import User from "../models/User";
import { signToken } from "../utils/jwt";
import { AuthRequest, Role } from "../types";

const ALLOWED_ROLES: Role[] = ["admin", "worker", "manager"];

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }
    const finalRole: Role = ALLOWED_ROLES.includes(role) ? role : "worker";

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const user = await User.create({ name, email, password, role: finalRole });
    const token = signToken({ id: user.id, role: user.role, name: user.name });

    return res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarColor: user.avatarColor },
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Registration failed" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    const token = signToken({ id: user.id, role: user.role, name: user.name });
    return res.status(200).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarColor: user.avatarColor },
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Login failed" });
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarColor: user.avatarColor },
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Failed to fetch profile" });
  }
};
