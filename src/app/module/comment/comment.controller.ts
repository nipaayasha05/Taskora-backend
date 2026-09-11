import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { commentService } from "./coment.service";

const createComment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;

  const payload = req.body;

  const organizationId = req.params.organizationId as string;
  const projectId = req.params.projectId as string;
  const sprintId = req.params.sprintId as string;
  const taskId = req.params.taskId as string;

  const result = await commentService.createComment(
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
    message: "SubTask created successfully",
    data: result,
  });
});

export const commentController = {
  createComment,
};
