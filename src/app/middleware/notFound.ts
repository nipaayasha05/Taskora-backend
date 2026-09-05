import { Request, Response } from "express";

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    name: "NotFound",
    message: "Route not found",
    error: null,
    stack: null,
    errorDetails: null,
    path: req.originalUrl,
  });
};
