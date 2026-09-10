import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { projectService } from "./project.service";

const createProject = catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;

  const payload = req.body;

  const organizationId = req.params.organizationId as string;

  const result = await projectService.createProject(
    user,
    payload,
    organizationId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Project created successfully",
    data: result,
  });
});

const createProjectTeams = catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;

  const payload = req.body;

  const projectId = req.params.projectId as string;

  //   const teamId = req.params.teamId as string;

  const result = await projectService.createProjectTeams(
    user,
    payload,
    projectId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Project teams created successfully",
    data: result,
  });
});

const getProject = catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;

  const projectId = req.params.projectId as string;
  const organizationId = req.params.organizationId as string;

  const result = await projectService.getProject(
    user,
    projectId,
    organizationId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Project retrieved successfully",
    data: result,
  });
});

export const projectController = {
  createProject,
  createProjectTeams,
  getProject,
};
