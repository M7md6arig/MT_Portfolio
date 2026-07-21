import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: "Route not found" });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({ error: "Validation failed", details: err.flatten().fieldErrors });
    return;
  }

  if (err instanceof MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE" ? "Image too large — maximum size is 5MB" : err.message;
    res.status(400).json({ error: message });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  // Record to update/delete was not found
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
    res.status(404).json({ error: "Resource not found" });
    return;
  }

  console.error("[unhandled error]", err);
  res.status(500).json({ error: "Internal server error" });
}
