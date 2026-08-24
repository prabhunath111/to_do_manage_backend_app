import { Router } from "express";
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/taskController";
import { protect, requireRole } from "../middleware/auth";

const router = Router();

router.use(protect);

// All roles can read (filtered per-role inside controller)
router.get("/", getTasks);
router.get("/:id", getTaskById);

// Admin can assign/create for anyone, Worker can create for self. Manager: forbidden.
router.post("/", requireRole("admin", "worker"), createTask);

// Admin can fully update/reassign, Worker can update status on own tasks. Manager: forbidden.
router.patch("/:id", requireRole("admin", "worker"), updateTask);

// Only Admin can delete
router.delete("/:id", requireRole("admin"), deleteTask);

export default router;
