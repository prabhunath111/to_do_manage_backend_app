import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import { Role } from "../types";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: Role;
  avatarColor: string;
  createdAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["admin", "worker", "manager"], default: "worker" },
    avatarColor: { type: String, default: "#6C63FF" },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model<IUser>("User", UserSchema);
