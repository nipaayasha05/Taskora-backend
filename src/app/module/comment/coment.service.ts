import { OrganizationRole } from "../../../../prisma/generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import { ICommentCreate } from "./comment.interface";
import httpStatus from "http-status";

const createComment = async (
  user: RequestUser,
  payload: ICommentCreate,
  organizationId: string,
  projectId: string,
  sprintId: string,
  taskId: string,
) => {
  if (!user.userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not logged in");
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
      "Only team's member can create a sub task",
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

  const comment = await prisma.comment.create({
    data: {
      ...payload,
      taskId,
      userId: user.userId,
    },
  });

  return comment;
};

export const commentService = {
  createComment,
};
