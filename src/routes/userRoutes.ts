import { Router } from "express";
import { listUsers } from "../controllers/userController";
import { protect } from "../middleware/auth";

const router = Router();

router.get("/", protect, listUsers);

export default router;
