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

  let statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  let errorMessage = err.message || "Internal Server Error";
  let errorName = err.name || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    statusCode,
    name:
      config.node_env === "development" ? errorName : "Internal Server Error",
    message:
      config.node_env === "development"
        ? errorMessage
        : "Internal Server Error",
    error: config.node_env === "development" ? err : undefined,
    stack: config.node_env === "development" ? err.stack : undefined,
    errorDetails: err.errorDetails || null,
    path: req.originalUrl,
  });
};
