import { UploadApiResponse } from "cloudinary";
import { OrganizationRole } from "../../../../prisma/generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import { IAttachmentCreate } from "./attachment.interface";
import httpStatus from "http-status";
import { cloudinary } from "../../lib/cloudinary";

const createAttachment = async (
  user: RequestUser,
  organizationId: string,
  projectId: string,
  sprintId: string,
  taskId: string,
  attachment: Express.Multer.File | null,
) => {
  if (!user.userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not logged in");
  }

  let attachmentUrl: string | undefined;

  if (attachment) {
    const attachmentUploadResult = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "auto",
              // public_id: `resume/${resume.originalname}`,
            },
            async (error, result) => {
              if (error) {
                return reject(error);
              }

              if (!result) {
                return reject(
                  new Error("No result returned from Cloudinary upload"),
                );
              }
              resolve(result);
            },
          )
          .end(attachment.buffer);
      },
    );
    attachmentUrl = attachmentUploadResult.secure_url;
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      organizationId,
    },
  });

  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  }

  const member = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId: user.userId,
      },
    },
  });
  if (!member) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "User is not a member of the organization",
    );
  }

  if (
    member.role !== OrganizationRole.OWNER &&
    member.role !== OrganizationRole.MANAGER &&
    member.role !== OrganizationRole.TEAM_MEMBER
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only team's member can create an attachment",
    );
  }

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      projectId,
      sprintId,
    },
  });

  if (!task) {
    throw new AppError(httpStatus.NOT_FOUND, "Task not found");
  }

  if (!attachment) {
    throw new AppError(httpStatus.BAD_REQUEST, "Attachment file is required");
  }

  const result = await prisma.attachment.create({
    data: {
      fileName: attachment?.originalname,
      fileUrl: attachmentUrl!,
      taskId,
      userId: user.userId,
    },
  });

  return result;
};

export const attachmentService = {
  createAttachment,
};
