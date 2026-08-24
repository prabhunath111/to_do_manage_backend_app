import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDB } from "./config/db";

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[server] Family To-Do API running on http://localhost:${PORT}`);
  });
};

start();
