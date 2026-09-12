import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import config from "../config";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (config.node_env === "development") {
    console.log("Error -globalErrorHandler", err);
  }

  const statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;

  const errorMessage = err.message || "Internal Server Error";

  const errorName = err.name || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    statusCode,
    name: errorName,
    message: errorMessage,
    error: err.message || null,
    stack: err.stack || null,
    errorDetails: err.errorDetails || null,
    path: req.originalUrl,
  });
};
