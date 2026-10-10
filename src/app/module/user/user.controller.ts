import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { userService } from "./user.service";

const getUserOverview = catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;
  const result = await userService.getUserOverview(user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User overview fetched successfully",
    data: result,
  });
});

const getAdminView = catchAsync(async (req, res) => {
  const result = await userService.getAdminView();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin dashboard overview retrieved successfully",
    data: result,
  });
});

export const userController = {
  getUserOverview,
  getAdminView,
};
