import { Response } from "express";
import User from "../models/User";
import { AuthRequest } from "../types";

// List all family members (used for assignment dropdowns, visible to all authenticated users)
export const listUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select("name email role avatarColor createdAt").sort({ name: 1 });
    return res.json({ users });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Failed to fetch users" });
  }
};
