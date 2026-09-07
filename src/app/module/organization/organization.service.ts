import { UploadApiResponse } from "cloudinary";
import { cloudinary } from "../../lib/cloudinary";
import {
  IOrganizationCreate,
  IOrganizationJoin,
  IOrganizationJoinUpdate,
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
          userId: reviewer.userId,
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

  const existingRequest = await prisma.organizationJoinRequest.findFirst({
    where: {
      organizationId,
      invitedToId: payload.invitedToId,
      status: OrganizationJoinRequestStatus.PENDING,
    },
  });

  if (existingRequest) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User already have a pending request to join the organization",
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

export const organizationService = {
  createOrganization,
  updateOrganization,
  joinOrganizationCreate,
  updateJoinOrganization,
};
