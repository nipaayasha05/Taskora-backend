import { UploadApiResponse } from "cloudinary";
import { IProfileCreatePayload } from "./profile.interface";
import { cloudinary } from "../../lib/cloudinary";
import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";

const profileCreate = async (
  user: RequestUser,
  payload: IProfileCreatePayload,
  resume: Express.Multer.File | null,
  avatar: Express.Multer.File | null,
) => {
  console.log({ user, payload, resume, avatar });

  let resumeUrl: string | undefined;
  let avatarUrl: string | undefined;

  if (resume) {
    const resumeUploadResult = await new Promise<UploadApiResponse>(
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
          .end(resume.buffer);
      },
    );
    resumeUrl = resumeUploadResult.secure_url;
  }

  // console.log({ resumeUploadResult });

  if (avatar) {
    const avatarUploadResult = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "image",
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
          .end(avatar.buffer);
      },
    );
    avatarUrl = avatarUploadResult.secure_url;
  }

  // console.log({ avatarUploadResult });

  const profile = await prisma.profile.create({
    data: {
      userId: user.userId,
      ...payload,
      ...(resumeUrl && { resume: resumeUrl }),
      ...(avatarUrl && { avatar: avatarUrl }),
    },
    include: {
      user: true,
    },
  });

  return profile;
};

const profileUpdate = async (
  user: RequestUser,
  payload: IProfileCreatePayload,
  resume: Express.Multer.File | null,
  avatar: Express.Multer.File | null,
) => {
  let resumeUrl: string | undefined;
  let avatarUrl: string | undefined;

  if (resume) {
    const resumeUploadResult = await new Promise<UploadApiResponse>(
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
          .end(resume.buffer);
      },
    );
    resumeUrl = resumeUploadResult.secure_url;
  }

  // console.log({ resumeUploadResult });

  if (avatar) {
    const avatarUploadResult = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "image",
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
          .end(avatar.buffer);
      },
    );
    avatarUrl = avatarUploadResult.secure_url;
  }
  const profileUpdate = await prisma.profile.update({
    where: {
      userId: user.userId,
    },
    data: {
      ...payload,
      ...(resumeUrl && { resume: resumeUrl }),
      ...(avatarUrl && { avatar: avatarUrl }),
    },
  });

  return profileUpdate;
};

export const profileService = {
  profileCreate,
  profileUpdate,
};
