import { UploadApiResponse } from "cloudinary";
import { cloudinary } from "../../lib/cloudinary";
import {
  IOrganizationCreate,
  IOrganizationJoin,
  IOrganizationJoinUpdate,
  IOrganizationMemberUpdate,
  IOrganizationUpdate,
} from "./organization.interface";
import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
import {
  OrganizationJoinRequestStatus,
  OrganizationRole,
  OrganizationStatus,
} from "../../../../prisma/generated/prisma/enums";
import { get } from "node:http";

const createOrganization = async (
  user: RequestUser,
  payload: IOrganizationCreate,
  logo: Express.Multer.File | null,
) => {
  let logoUrl: string | undefined;

  if (logo) {
    const logoUploadResult = await new Promise<UploadApiResponse>(
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
          .end(logo.buffer);
      },
    );
    logoUrl = logoUploadResult.secure_url;
  }

  const createOrganization = await prisma.organization.create({
    data: {
      ...payload,
      ...(logoUrl && { logo: logoUrl }),
      createdById: user.userId,
    },
  });
  return createOrganization;
};

const getMyOrganization = async (user: RequestUser) => {
  if (!user.userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not logged in");
  }

  const result = await prisma.organization.findFirst({
    where: {
      createdById: user.userId,
    },
    include: {
      createdBy: true,
      members: true,
      teams: true,
      projects: true,
    },
  });
  return result;
};

const getAllOrganization = async () => {
  const result = await prisma.organization.findMany({
    include: {
      createdBy: true,
      members: true,
      teams: true,
      projects: true,
    },
  });
  return result;
};

const getAllOrganizationPublic = async () => {
  const result = await prisma.organization.findMany({
    where: {
      status: "APPROVED",
    },
    select: {
      id: true,
      name: true,
      description: true,
      logo: true,

      members: {
        where: {
          role: {
            in: ["OWNER", "MANAGER"],
          },
        },
        select: {
          role: true,
          user: {
            select: {
              name: true,
              email: true,
              profile: {
                select: {
                  contactNumber: true,
                },
              },
            },
          },
        },
      },
      _count: {
        select: {
          projects: true,
        },
      },
    },
  });
  return result;
};

const updateOrganization = async (
  reviewer: RequestUser,
  organizationId: string,
  payload: IOrganizationUpdate,
) => {
  const { status } = payload;

  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
  });

  if (!organization) {
    throw new AppError(httpStatus.NOT_FOUND, "Organization not found");
  }

  if (organization.status !== OrganizationStatus.PENDING) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Only pending organizations can be reviewed",
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedOrganization = await tx.organization.update({
      where: {
        id: organizationId,
      },
      data: {
        status,
      },
    });

    if (status === OrganizationStatus.APPROVED) {
      await tx.organizationMember.create({
        data: {
          organizationId: updatedOrganization.id,
          userId: organization.createdById,
          role: "OWNER",
        },
      });
    }

    return updatedOrganization;
  });
  return result;
};

const joinOrganizationCreate = async (
  user: RequestUser,
  organizationId: string,
  payload: IOrganizationJoin,
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

  if (
    member?.role !== OrganizationRole.OWNER &&
    member?.role !== OrganizationRole.MANAGER
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Only users with role OWNER or MANAGER can request to join organizations",
    );
  }

  const existingMember = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId: payload.invitedToId,
      },
    },
  });

  if (existingMember) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User already a member of the organization",
    );
  }

  const existingRequest = await prisma.organizationJoinRequest.findFirst({
    where: {
      organizationId,
      invitedToId: payload.invitedToId,
      status: OrganizationJoinRequestStatus.PENDING,
    },
  });

  console.log("organizationId:", organizationId);
  console.log("invitedToId:", payload.invitedToId);
  console.log("existingRequest:", existingRequest);

  if (existingRequest) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User already has a pending invitation to this organization",
    );
  }

  const joinRequst = await prisma.organizationJoinRequest.create({
    data: {
      organizationId,
      invitedToId: payload.invitedToId,
      invitedById: user.userId,
    },
  });
  return joinRequst;
};

const getJoinOrganization = async (
  user: RequestUser,
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

  if (
    member?.role !== OrganizationRole.OWNER &&
    member?.role !== OrganizationRole.MANAGER
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Only users with role OWNER or MANAGER can request to join organizations",
    );
  }

  const result = await prisma.organizationJoinRequest.findMany({
    where: {
      organizationId,
      status: OrganizationJoinRequestStatus.PENDING,
    },
    include: {
      organization: true,
      invitedTo: true,
    },
  });
  return result;
};

const updateJoinOrganization = async (
  user: RequestUser,
  organizationId: string,
  payload: IOrganizationJoinUpdate,
) => {
  const { invitedToId, status } = payload;

  if (!user.userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not logged in");
  }

  if (invitedToId !== user.userId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You can only respond to your own invitation",
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const joinRequest = await tx.organizationJoinRequest.findFirst({
      where: {
        organizationId,
        invitedToId,
        status: OrganizationJoinRequestStatus.PENDING,
      },
    });

    if (!joinRequest) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "Organization join request not found",
      );
    }

    const updatedOrganizationJoinRequest =
      await tx.organizationJoinRequest.update({
        where: {
          id: joinRequest.id,
        },
        data: {
          status,
        },
      });

    if (!updatedOrganizationJoinRequest) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "Organization join request not found",
      );
    }

    if (status === OrganizationJoinRequestStatus.APPROVED) {
      const existingMember = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId,
            userId: user.userId,
          },
        },
      });

      if (existingMember) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "User already have a member of the organization",
        );
      }

      await tx.organizationMember.create({
        data: {
          organizationId,
          userId: user.userId,
          role: joinRequest.role,
        },
      });
    }

    return updatedOrganizationJoinRequest;
  });

  return result;
};

const getMyJoinOrganization = async (
  user: RequestUser,
  organizationId: string,
) => {
  if (!user.userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not logged in");
  }

  const result = await prisma.organizationJoinRequest.findMany({
    where: {
      // organizationId,
      invitedToId: user.userId,
      status: OrganizationJoinRequestStatus.PENDING,
    },
    include: {
      organization: true,
      invitedBy: true,
    },
  });
  return result;
};

const updateOrganizationMember = async (
  user: RequestUser,
  organizationId: string,
  memberId: string,
  payload: IOrganizationMemberUpdate,
) => {
  const { role } = payload;
  if (!user.userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not logged in");
  }

  const currentMember = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId: user.userId,
      },
    },
  });

  if (!currentMember) {
    throw new AppError(httpStatus.NOT_FOUND, "Organization member not found");
  }

  if (currentMember.role !== OrganizationRole.OWNER) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Only OWNER can update member role",
    );
  }

  const member = await prisma.organizationMember.findUnique({
    where: {
      id: memberId,
    },
  });

  if (!member) {
    throw new AppError(httpStatus.NOT_FOUND, "Organization member not found");
  }

  if (member?.role === OrganizationRole.OWNER) {
    throw new AppError(httpStatus.BAD_REQUEST, "Owner cannot be updated");
  }

  if (member.organizationId !== organizationId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Member not part of the organization",
    );
  }

  const result = await prisma.organizationMember.update({
    where: {
      id: memberId,
    },
    data: {
      role,
    },
  });
  return result;
};

const getOrganizationMember = async (
  user: RequestUser,
  organizationId: string,
  memberId: string,
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
    throw new AppError(httpStatus.NOT_FOUND, "Organization member not found");
  }

  if (
    member.role === OrganizationRole.TEAM_MEMBER &&
    member.userId !== memberId
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Only users with role TEAM_MEMBER can request to join organizations",
    );
  }

  if (
    member?.role !== OrganizationRole.OWNER &&
    member?.role !== OrganizationRole.MANAGER
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Only users with role OWNER or MANAGER can request to join organizations",
    );
  }

  const result = await prisma.organizationMember.findMany({
    where: {
      organizationId,
    },
    include: {
      organization: true,
      user: true,
    },
  });
  return result;
};

const getOrganizationOverview = async (
  organizationId: string,
  user: RequestUser,
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
    throw new AppError(httpStatus.NOT_FOUND, "Organization member not found");
  }

  const [
    totalMembers,
    totalTeams,
    totalProjects,
    totalSprints,
    totalTasks,

    activeProjects,
    completedProjects,

    activeSprints,

    pendingJoinRequests,

    totalPayments,
    successfulPayments,
    pendingPayments,

    recentProjects,
    recentSprints,
    recentMembers,
    recentPayments,
  ] = await Promise.all([
    prisma.organizationMember.count({
      where: {
        organizationId,
      },
    }),

    prisma.team.count({
      where: {
        organizationId,
      },
    }),

    prisma.project.count({
      where: {
        organizationId,
      },
    }),

    prisma.sprint.count({
      where: {
        project: {
          organizationId,
        },
      },
    }),

    prisma.task.count({
      where: {
        project: {
          organizationId,
        },
      },
    }),

    prisma.project.count({
      where: {
        organizationId,
        status: "ACTIVE",
      },
    }),

    prisma.project.count({
      where: {
        organizationId,
        status: "COMPLETED",
      },
    }),

    prisma.sprint.count({
      where: {
        project: {
          organizationId,
        },
        status: "ACTIVE",
      },
    }),

    prisma.organizationJoinRequest.count({
      where: {
        organizationId,
        status: "PENDING",
      },
    }),

    prisma.payment.count({
      where: {
        sprint: {
          project: {
            organizationId,
          },
        },
      },
    }),

    prisma.payment.count({
      where: {
        status: "SUCCESS",
        sprint: {
          project: {
            organizationId,
          },
        },
      },
    }),

    prisma.payment.count({
      where: {
        status: "PENDING",
        sprint: {
          project: {
            organizationId,
          },
        },
      },
    }),

    prisma.project.findMany({
      where: {
        organizationId,
      },
      select: {
        id: true,
        name: true,
        status: true,
        startDate: true,
        dueDate: true,
        createdAt: true,

        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),

    prisma.sprint.findMany({
      where: {
        project: {
          organizationId,
        },
      },
      select: {
        id: true,
        name: true,
        goal: true,
        status: true,
        paymentAmount: true,
        startDate: true,
        endDate: true,
        createdAt: true,

        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),

    prisma.organizationMember.findMany({
      where: {
        organizationId,
      },
      select: {
        id: true,
        role: true,
        createdAt: true,

        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),

    prisma.payment.findMany({
      where: {
        sprint: {
          project: {
            organizationId,
          },
        },
      },
      select: {
        id: true,
        amount: true,
        status: true,
        transactionId: true,
        paidAt: true,
        createdAt: true,

        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        sprint: {
          select: {
            id: true,
            name: true,

            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),
  ]);
  return {
    summary: {
      members: totalMembers,
      teams: totalTeams,
      projects: totalProjects,
      sprints: totalSprints,
      tasks: totalTasks,
      activeProjects,
      completedProjects,

      activeSprints,

      pendingJoinRequests,
      payments: {
        total: totalPayments,
        successful: successfulPayments,
        pending: pendingPayments,
      },
    },
    recent: {
      projects: recentProjects,
      sprints: recentSprints,
      members: recentMembers,
      payments: recentPayments,
    },
  };
};

export const organizationService = {
  createOrganization,
  getMyOrganization,
  getAllOrganization,
  updateOrganization,
  joinOrganizationCreate,
  getJoinOrganization,
  getMyJoinOrganization,
  updateJoinOrganization,
  updateOrganizationMember,
  getOrganizationMember,
  getAllOrganizationPublic,
  getOrganizationOverview,
};
