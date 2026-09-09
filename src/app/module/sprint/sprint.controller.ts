import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { sprintService } from "./sprint.service";

const createSprint = catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;

  const payload = req.body;

  const organizationId = req.params.organizationId as string;
  const projectId = req.params.projectId as string;

  const result = await sprintService.createSprint(
    user,
    payload,
    organizationId,
    projectId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Sprint created successfully",
    data: result,
  });
});

const createSprintTeam = catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;

  const payload = req.body;

  const organizationId = req.params.organizationId as string;

  const sprintId = req.params.sprintId as string;
  const projectId = req.params.projectId as string;

  const result = await sprintService.createSprintTeam(
    user,
    payload,
    organizationId,
    sprintId,
    projectId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Sprint team created successfully",
    data: result,
  });
});

export const sprintController = {
  createSprint,
  createSprintTeam,
};
