import mongoose, { Schema, Document, Types } from "mongoose";
import { TaskStatus, TaskPriority } from "../types";

export interface ITask extends Document {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  assignedTo: Types.ObjectId;
  assignedBy: Types.ObjectId;
  createdBy: Types.ObjectId;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    dueDate: { type: Date },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

TaskSchema.index({ status: 1, priority: 1, assignedTo: 1, dueDate: 1 });

export default mongoose.model<ITask>("Task", TaskSchema);
