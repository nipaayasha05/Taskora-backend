import cookieParser from "cookie-parser";
import type { Application, Request, Response } from "express";
import express from "express";
import cors from "cors";
import config from "./app/config";
import helmet from "helmet";
import httpStatus from "http-status";
import { authRoutes } from "./app/module/auth/auth.route";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { profileRoutes } from "./app/module/profile/profile.route";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", profileRoutes);

app.get("/", async (req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: "Welcome to Taskora",
  });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
