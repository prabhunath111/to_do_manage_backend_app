import { Request, Response, NextFunction } from "express";

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("[error]", err);
  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || "Internal server error",
  });
};
