import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { taskService } from "./task.service";

const createTask = catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;

  const payload = req.body;

  const organizationId = req.params.organizationId as string;
  const projectId = req.params.projectId as string;
  const sprintId = req.params.sprintId as string;

  const result = await taskService.createTask(
    user,
    payload,
    organizationId,
    projectId,
    sprintId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task created successfully",
    data: result,
  });
});

const updateTask = catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;

  const payload = req.body;

  const organizationId = req.params.organizationId as string;
  const projectId = req.params.projectId as string;
  const sprintId = req.params.sprintId as string;
  const taskId = req.params.taskId as string;

  const result = await taskService.updateTask(
    user,
    payload,
    organizationId,
    projectId,
    sprintId,
    taskId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task updated successfully",
    data: result,
  });
});

export const taskController = {
  createTask,
  updateTask,
};
