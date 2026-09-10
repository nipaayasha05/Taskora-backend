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
import { organizationRoutes } from "./app/module/organization/organization.route";
import { teamRoutes } from "./app/module/team/team.route";
import { projectRoutes } from "./app/module/project/project.route";
import { sprintRoutes } from "./app/module/sprint/sprint.route";
import { taskRoutes } from "./app/module/task/task.route";
import { subTaskRoutes } from "./app/module/subTask/subTask.route";
import { paymentRoutes } from "./app/module/payment/payment.route";

const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

const endpointSecret = config.stripe_webhook_secret;

app.use("/api/v1/payments/confirm", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", profileRoutes);
app.use("/api/v1/organizations", organizationRoutes);
app.use("/api/v1/organization/teams", teamRoutes);
app.use("/api/v1/organization/projects", projectRoutes);
app.use("/api/v1/organization/projects/sprints", sprintRoutes);
app.use("/api/v1/organization/projects/sprints/tasks", taskRoutes);
app.use("/api/v1/organization/projects/sprints/tasks/subtasks", subTaskRoutes);

app.use("/api/v1/payments", paymentRoutes);

app.get("/", async (req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: "Welcome to Taskora",
  });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
