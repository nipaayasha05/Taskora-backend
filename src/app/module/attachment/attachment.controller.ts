import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { attachmentService } from "./attachment.service";

const createAttachment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;

  //   const payload = req.body;

  const organizationId = req.params.organizationId as string;
  const projectId = req.params.projectId as string;
  const sprintId = req.params.sprintId as string;
  const taskId = req.params.taskId as string;

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  console.log({ files });

  const attachment = files?.["attachment"] ? files["attachment"][0] : null;

  const result = await attachmentService.createAttachment(
    user,
    organizationId,
    projectId,
    sprintId,
    taskId,
    attachment,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Attachment created successfully",
    data: result,
  });
});

export const attachmentController = {
  createAttachment,
};
