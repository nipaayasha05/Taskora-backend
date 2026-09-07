import { UploadApiResponse } from "cloudinary";
import { cloudinary } from "../../lib/cloudinary";
import {
  IOrganizationCreate,
  IOrganizationUpdate,
} from "./organization.interface";
import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
import { OrganizationStatus } from "../../../../prisma/generated/prisma/enums";

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

export const organizationService = {
  createOrganization,
  updateOrganization,
};
