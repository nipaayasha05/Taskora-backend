import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { organizationService } from "./organization.service";
import { RequestUser } from "../../middleware/checkAuth";

const createOrganization = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const logo = files?.["logo"] ? files["logo"][0] : null;

  const payload = req.body.data ? JSON.parse(req.body.data) : null;

  const result = await organizationService.createOrganization(
    user as RequestUser,
    payload,
    logo,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Organization created successfully",
    data: result,
  });
});

const updateOrganization = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const organizationId = req.params.organizationId;
  const payload = req.body;

  const result = await organizationService.updateOrganization(
    user as RequestUser,
    organizationId as string,
    payload,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Organization updated successfully",
    data: result,
  });
});

const joinOrganizationCreate = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;

    const organizationId = req.params.organizationId;

    const payload = req.body;

    const result = await organizationService.joinOrganizationCreate(
      user as RequestUser,
      organizationId as string,
      payload,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Organization joined successfully",
      data: result,
    });
  },
);

const updateJoinOrganization = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;

    const organizationId = req.params.organizationId;

    const payload = req.body;

    const result = await organizationService.updateJoinOrganization(
      user as RequestUser,
      organizationId as string,
      payload,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Organization updated successfully",
      data: result,
    });
  },
);

export const organizationController = {
  createOrganization,
  updateOrganization,
  joinOrganizationCreate,
  updateJoinOrganization,
};
