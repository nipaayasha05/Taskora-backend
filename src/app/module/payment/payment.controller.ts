import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { paymentService } from "./payment.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createCheckoutSession = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user!;
    const { sprintId } = req.body;

    const result = await paymentService.creareCheckoutSession(
      user,
      sprintId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Checkout session created successfully",
      data: result,
    });
  },
);

const handleWebhook = catchAsync(async (req: Request, res: Response) => {
  console.log("BODY IS BUFFER:", Buffer.isBuffer(req.body));
  console.log("BODY TYPE:", typeof req.body);
  console.log("SIGNATURE EXISTS:", !!req.headers["stripe-signature"]);

  const event = req.body as Buffer;

  const signature = req.headers["stripe-signature"]!;

  await paymentService.handleWebhook(event, signature as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Webhook received successfully",
    data: null,
  });
});

export const paymentController = {
  createCheckoutSession,
  handleWebhook,
};
