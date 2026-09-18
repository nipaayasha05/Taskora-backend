import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { teamService } from "./team.service";
import httpStatus from "http-status";

const createTeam = catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;

  const payload = req.body;

  const organizationId = req.params.organizationId as string;

  const result = await teamService.createTeam(user, payload, organizationId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Team created successfully",
    data: result,
  });
});

const getTeamList = catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;

  const organizationId = req.params.organizationId as string;

  const result = await teamService.getTeamList(user, organizationId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Team list fetched successfully",
    data: result,
  });
});

const updateTeam = catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;

  const payload = req.body;

  const organizationId = req.params.organizationId as string;

  const teamId = req.params.teamId as string;

  const result = await teamService.updateTeam(
    user,
    payload,
    organizationId,
    teamId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Team updated successfully",
    data: result,
  });
});

const createTeamMember = catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;

  const payload = req.body;

  const organizationId = req.params.organizationId as string;

  const teamId = req.params.teamId as string;

  const result = await teamService.createTeamMember(
    user,
    payload,
    organizationId,
    teamId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Team member created successfully",
    data: result,
  });
});

const getTeamMemberList = catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;

  const organizationId = req.params.organizationId as string;

  const teamId = req.params.teamId as string;

  const result = await teamService.getTeamMemberList(
    user,
    organizationId,
    teamId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Team member list fetched successfully",
    data: result,
  });
});

export const teamController = {
  createTeam,
  getTeamList,
  updateTeam,
  createTeamMember,

  getTeamMemberList,
};
