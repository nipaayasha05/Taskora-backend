import { OrganizationRole } from "../../../../prisma/generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import { ITeamCreate, ITeamMemberCreate } from "./team.interface";
import httpStatus from "http-status";

const createTeam = async (
  user: RequestUser,
  payload: ITeamCreate,
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
      "Only organization owner or manager can create a team",
    );
  }

  const existingTeam = await prisma.team.findUnique({
    where: {
      name_organizationId: {
        name: payload.name,
        organizationId,
      },
    },
  });

  if (existingTeam) {
    throw new AppError(httpStatus.CONFLICT, "Team name already exists");
  }

  const team = await prisma.team.create({
    data: {
      ...payload,
      organizationId,
      createdById: user.userId,
    },
  });
  return team;
};

const createTeamMember = async (
  user: RequestUser,
  payload: ITeamMemberCreate,
  organizationId: string,
  teamId: string,
) => {
  const { userIds } = payload;

  if (!user.userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not logged in");
  }

  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      organizationId,
    },
  });

  if (!team) {
    throw new AppError(httpStatus.NOT_FOUND, "Team not found");
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
      httpStatus.NOT_FOUND,
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

  const organizationMember = await prisma.organizationMember.findMany({
    where: {
      organizationId,
      userId: {
        in: userIds,
      },
    },
  });

  if (organizationMember.length !== userIds.length) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "One or more users are not members of the organization",
    );
  }

  const existingMember = await prisma.teamMember.findMany({
    where: {
      teamId,
      userId: {
        in: userIds,
      },
    },
  });

  if (existingMember.length > 0) {
    throw new AppError(
      httpStatus.CONFLICT,
      "One or more team members already exist",
    );
  }

  const result = await prisma.teamMember.createMany({
    data: userIds.map((userId) => ({
      teamId,
      userId,
    })),
  });
  return result;
};

export const teamService = {
  createTeam,
  createTeamMember,
};
