import { OrganizationRole } from "../../../../prisma/generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import { ITeamCreate } from "./team.interface";
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

export const teamService = {
  createTeam,
};
