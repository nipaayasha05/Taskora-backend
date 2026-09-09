import {
  OrganizationRole,
  SprintStatus,
} from "../../../../prisma/generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import {
  ISprintCreate,
  ISprintTeamCreate,
  ISprintUpdate,
} from "./sprint.interface";
import httpStatus from "http-status";

const createSprint = async (
  user: RequestUser,
  payload: ISprintCreate,
  organizationId: string,
  projectId: string,
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
    member.role !== OrganizationRole.MANAGER
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only organization owner or manager can create a sprint",
    );
  }

  const existingSprint = await prisma.sprint.findUnique({
    where: {
      projectId_name: {
        name: payload.name,
        projectId,
      },
    },
  });

  if (existingSprint) {
    throw new AppError(httpStatus.BAD_REQUEST, "Sprint already exists");
  }

  if (payload.startDate && payload.endDate) {
    if (new Date(payload.startDate) >= new Date(payload.endDate)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Start date must be before end date",
      );
    }
  }

  const sprint = await prisma.sprint.create({
    data: {
      ...payload,
      projectId,
      createdById: user.userId,
    },
  });

  return sprint;
};

const updateSprint = async (
  user: RequestUser,
  payload: ISprintUpdate,
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
      "Only organization owner or manager can update a sprint",
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
      "Sprint is completed. You can not update it",
    );
  }

  // const existingSprint = await prisma.sprint.findFirst({
  //   where: {

  //       id: sprintId,
  //       projectId,

  //   },
  // });

  // if (!existingSprint) {
  //   throw new AppError(httpStatus.NOT_FOUND, "Sprint not found");
  // }

  const startDate = payload.startDate
    ? new Date(payload.startDate)
    : sprint.startDate;

  const endDate = payload.endDate ? new Date(payload.endDate) : sprint.endDate;

  if (startDate >= endDate) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Start date must be before end date",
    );
  }

  const result = await prisma.sprint.update({
    where: {
      id: sprint.id,
    },
    data: {
      ...payload,
    },
  });
  return result;
};

const createSprintTeam = async (
  user: RequestUser,
  payload: ISprintTeamCreate,
  organizationId: string,
  sprintId: string,
  projectId: string,
) => {
  if (!user.userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not logged in");
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

  const team = await prisma.team.findMany({
    where: {
      id: {
        in: payload.teamIds,
      },
    },
  });

  if (team.length !== payload.teamIds.length) {
    throw new AppError(httpStatus.NOT_FOUND, "One or more teams not found");
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
    member.role !== OrganizationRole.MANAGER
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only organization owner or manager can add a team member to the team",
    );
  }

  const projectTeam = await prisma.projectTeam.findMany({
    where: {
      projectId,
      teamId: {
        in: payload.teamIds,
      },
    },
  });
  if (projectTeam.length !== payload.teamIds.length) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "One or more teams are not assigned to this project",
    );
  }

  const existingSprintTeam = await prisma.sprintTeam.findMany({
    where: {
      sprintId,
      teamId: {
        in: payload.teamIds,
      },
    },
  });

  if (existingSprintTeam.length > 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Sprint team already exists");
  }

  const sprintTeam = await prisma.sprintTeam.createMany({
    data: payload.teamIds.map((teamId) => ({
      sprintId,
      teamId,
      createdById: user.userId,
    })),
  });
  return sprintTeam;
};

export const sprintService = {
  createSprint,
  updateSprint,
  createSprintTeam,
};
