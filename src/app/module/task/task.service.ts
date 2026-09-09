import {
  OrganizationRole,
  SprintStatus,
} from "../../../../prisma/generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import { ITaskCreate, ITaskUpdate } from "./task.interface";
import httpStatus from "http-status";

const createTask = async (
  user: RequestUser,
  payload: ITaskCreate,
  organizationId: string,
  projectId: string,
  sprintId: string,
) => {
  if (!user.userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not logged in");
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
    member.role !== OrganizationRole.MANAGER
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only organization owner or manager can create a sprint",
    );
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

  const sprint = await prisma.sprint.findFirst({
    where: {
      id: sprintId,
      projectId,
    },
  });

  if (!sprint) {
    throw new AppError(httpStatus.NOT_FOUND, "Sprint not found");
  }

  if (sprint.status === SprintStatus.COMPLETED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Sprint is completed. You can not create new tasks",
    );
  }

  const sprintTeam = await prisma.sprintTeam.findFirst({
    where: {
      sprintId,
      id: payload.sprintTeamId,
    },
  });

  if (!sprintTeam) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This team is not assigned to the sprint",
    );
  }

  if (payload.dueDate) {
    const dueDate = new Date(payload.dueDate);

    if (dueDate < sprint.startDate || dueDate > sprint.endDate) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Due date must be between sprint start and end date",
      );
    }
  }

  const task = await prisma.task.create({
    data: {
      ...payload,
      sprintId,
      projectId,
      createdById: user.userId,
    },
  });
  return task;
};

const updateTask = async (
  user: RequestUser,
  payload: ITaskUpdate,
  organizationId: string,
  projectId: string,
  sprintId: string,
  taskId: string,
) => {
  if (!user.userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not logged in");
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
    member.role !== OrganizationRole.MANAGER
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only organization owner or manager can update a task",
    );
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

  const sprint = await prisma.sprint.findFirst({
    where: {
      id: sprintId,
      projectId,
    },
  });

  if (!sprint) {
    throw new AppError(httpStatus.NOT_FOUND, "Sprint not found");
  }

  if (sprint.status === SprintStatus.COMPLETED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Sprint is completed. You can not update tasks",
    );
  }

  const sprintTeam = await prisma.sprintTeam.findFirst({
    where: {
      sprintId,
      id: payload.sprintTeamId,
    },
  });

  if (!sprintTeam) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This team is not assigned to the sprint",
    );
  }

  if (payload.dueDate) {
    const dueDate = new Date(payload.dueDate);

    if (dueDate < sprint.startDate || dueDate > sprint.endDate) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Due date must be between sprint start and end date",
      );
    }
  }

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      sprintId,
      projectId,
    },
  });

  if (!task) {
    throw new AppError(httpStatus.NOT_FOUND, "Task not found");
  }

  const updatedTask = await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      ...payload,
    },
  });
  return updatedTask;
};

export const taskService = {
  createTask,
  updateTask,
};
