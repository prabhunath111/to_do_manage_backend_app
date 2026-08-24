import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes";
import taskRoutes from "./routes/taskRoutes";
import userRoutes from "./routes/userRoutes";
import { notFound, errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ status: "ok", service: "family-todo-backend" }));

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
