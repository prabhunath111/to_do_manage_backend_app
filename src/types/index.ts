import { Request } from "express";

export type Role = "admin" | "worker" | "manager";

export interface JwtPayload {
  id: string;
  role: Role;
  name: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type TaskPriority = "low" | "medium" | "high";
