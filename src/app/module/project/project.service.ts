import { OrganizationRole } from "../../../../prisma/generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import { IProjectCreate, IProjectTeamCreate } from "./project.interface";
import httpStatus from "http-status";

const createProject = async (
  user: RequestUser,
  payload: IProjectCreate,
  organizationId: string,
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
      "Only organization owner or manager can create a project",
    );
  }

  const existingProject = await prisma.project.findUnique({
    where: {
      name_organizationId: {
        name: payload.name,
        organizationId,
      },
    },
  });

  if (existingProject) {
    throw new AppError(httpStatus.BAD_REQUEST, "Project already exists");
  }

  if (payload.startDate && payload.dueDate) {
    if (new Date(payload.startDate) >= new Date(payload.dueDate)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Start date must be before due date",
      );
    }
  }

  if (!payload.clientId) {
    throw new AppError(httpStatus.NOT_FOUND, "Client Id is required");
  }

  const client = await prisma.user.findUnique({
    where: {
      id: payload.clientId,
    },
  });

  if (!client) {
    throw new AppError(httpStatus.NOT_FOUND, "Client not found");
  }

  const project = await prisma.project.create({
    data: {
      ...payload,
      organizationId,
      createdById: user.userId,
    },
  });
  return project;
};

const createProjectTeams = async (
  user: RequestUser,
  payload: IProjectTeamCreate,
  projectId: string,
) => {
  if (!user.userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not logged in");
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  }

  const member = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: project.organizationId,
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
      "Only organization owner or manager can add a team to the project",
    );
  }

  const teams = await prisma.team.findMany({
    where: {
      organizationId: project.organizationId,
      id: {
        in: payload.teamIds,
      },
    },
  });

  if (teams.length !== payload.teamIds.length) {
    throw new AppError(httpStatus.NOT_FOUND, "One or more teams not found");
  }

  const existing = await prisma.projectTeam.findMany({
    where: {
      projectId,
      teamId: {
        in: payload.teamIds,
      },
    },
  });

  if (existing.length > 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "One or more teams already exists",
    );
  }

  const result = await prisma.projectTeam.createMany({
    data: payload.teamIds.map((teamId) => ({
      projectId,
      teamId,
    })),
  });

  return result;
};

const getProject = async (
  user: RequestUser,
  projectId: string,
  organizationId: string,
) => {
  if (!user.userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not logged in");
  }

  const result = await prisma.project.findFirst({
    where: {
      id: projectId,
      organizationId,
      clientId: user.userId,
    },
    include: {
      client: true,
      projectTeams: {
        include: {
          team: true,
        },
      },
      sprints: {
        include: {
          sprintTeams: {
            include: {
              team: true,
            },
          },
        },
      },
      tasks: {
        include: {
          subTasks: true,
        },
      },
    },
  });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  }
  return result;
};

export const projectService = {
  createProject,
  createProjectTeams,
  getProject,
};
