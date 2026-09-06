import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { profileService } from "./profile.service";
import { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import { create } from "node:domain";

const profileCreate = catchAsync(async (req: Request, res: Response) => {
  // console.log({  req.user });
  const user = req.user;

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not found by ID");
  }

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  console.log({ files });

  const resume = files?.["resume"] ? files["resume"][0] : null;
  const avatar = files?.["avatar"] ? files["avatar"][0] : null;

  const payload = req.body.data ? JSON.parse(req.body.data) : {};

  console.log({ payload, skills: payload.skills });

  const result = await profileService.profileCreate(
    user,
    payload,
    resume,
    avatar,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile created successfully",
    data: result,
  });
});

const profileUpdate = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not found by ID");
  }

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  console.log({ files });

  const resume = files?.["resume"] ? files["resume"][0] : null;
  const avatar = files?.["avatar"] ? files["avatar"][0] : null;

  const payload = req.body.data ? JSON.parse(req.body.data) : {};

  const result = await profileService.profileUpdate(
    user,
    payload,
    resume,
    avatar,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

export const profileController = {
  profileCreate,
  profileUpdate,
};
