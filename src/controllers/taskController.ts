import { Response } from "express";
import Task from "../models/Task";
import { AuthRequest } from "../types";

// GET /api/tasks  -- supports filters via query params
// status, priority, assignedTo, from, to, search
// Role rules:
//   admin   -> sees all tasks
//   manager -> sees all tasks (read-only)
//   worker  -> sees only tasks assigned to them
export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { status, priority, assignedTo, from, to, search } = req.query as Record<string, string>;
    const filter: Record<string, any> = {};

    if (req.user!.role === "worker") {
      filter.assignedTo = req.user!.id;
    } else if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) filter.title = { $regex: search, $options: "i" };
    if (from || to) {
      filter.dueDate = {};
      if (from) filter.dueDate.$gte = new Date(from);
      if (to) filter.dueDate.$lte = new Date(to);
    }

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email role avatarColor")
      .populate("assignedBy", "name email role avatarColor")
      .sort({ createdAt: -1 });

    return res.json({ tasks, count: tasks.length });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Failed to fetch tasks" });
  }
};

export const getTaskById = async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "name email role avatarColor")
      .populate("assignedBy", "name email role avatarColor");
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (req.user!.role === "worker" && task.assignedTo._id.toString() !== req.user!.id) {
      return res.status(403).json({ message: "You can only view tasks assigned to you" });
    }
    return res.json({ task });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Failed to fetch task" });
  }
};

// POST /api/tasks
// admin  -> can create & assign to anyone
// worker -> can create tasks for themself only
// manager -> forbidden (enforced by route middleware)
export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, priority, dueDate, assignedTo } = req.body;
    if (!title) return res.status(400).json({ message: "title is required" });

    let finalAssignedTo = assignedTo;
    if (req.user!.role === "worker") {
      finalAssignedTo = req.user!.id; // workers may only self-assign
    } else if (!assignedTo) {
      return res.status(400).json({ message: "assignedTo is required for admin-created tasks" });
    }

    const task = await Task.create({
      title,
      description,
      priority: priority || "medium",
      dueDate: dueDate ? new Date(dueDate) : undefined,
      assignedTo: finalAssignedTo,
      assignedBy: req.user!.id,
      createdBy: req.user!.id,
      status: "pending",
    });

    const populated = await task.populate([
      { path: "assignedTo", select: "name email role avatarColor" },
      { path: "assignedBy", select: "name email role avatarColor" },
    ]);

    return res.status(201).json({ task: populated });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Failed to create task" });
  }
};

// PATCH /api/tasks/:id
// admin  -> can update any field, reassign, change status
// worker -> can update status only, on tasks assigned to them
// manager -> forbidden (enforced by route middleware)
export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (req.user!.role === "worker") {
      if (task.assignedTo.toString() !== req.user!.id) {
        return res.status(403).json({ message: "You can only update tasks assigned to you" });
      }
      const { status } = req.body;
      if (status) {
        task.status = status;
        task.completedAt = status === "completed" ? new Date() : undefined;
      }
    } else if (req.user!.role === "admin") {
      const { title, description, priority, dueDate, assignedTo, status } = req.body;
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (priority !== undefined) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : undefined;
      if (assignedTo !== undefined) task.assignedTo = assignedTo;
      if (status !== undefined) {
        task.status = status;
        task.completedAt = status === "completed" ? new Date() : undefined;
      }
    }

    await task.save();
    const populated = await task.populate([
      { path: "assignedTo", select: "name email role avatarColor" },
      { path: "assignedBy", select: "name email role avatarColor" },
    ]);

    return res.json({ task: populated });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Failed to update task" });
  }
};

// DELETE /api/tasks/:id -- admin only (enforced by route middleware)
export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    return res.json({ message: "Task deleted", id: req.params.id });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Failed to delete task" });
  }
};
