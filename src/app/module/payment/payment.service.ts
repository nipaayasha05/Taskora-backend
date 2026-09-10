import {
  PaymentStatus,
  SprintStatus,
} from "../../../../prisma/generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
import { handleCheckoutCompleted } from "../../utils/payment";

const creareCheckoutSession = async (user: RequestUser, sprintId: string) => {
  if (!user.userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not logged in");
  }

  if (!sprintId) {
    throw new AppError(httpStatus.BAD_REQUEST, "Sprint ID is required");
  }

  const transactionResult = await prisma.$transaction(async (tx) => {
    const client = await tx.user.findFirst({
      where: {
        id: user.userId,
      },
      include: {
        payments: true,
      },
    });

    if (!client) {
      throw new AppError(httpStatus.NOT_FOUND, "Client not found");
    }

    const sprint = await tx.sprint.findFirst({
      where: {
        id: sprintId,
      },
      include: {
        payments: true,
      },
    });

    if (!sprint) {
      throw new AppError(httpStatus.NOT_FOUND, "Sprint not found");
    }

    if (sprint.status !== SprintStatus.COMPLETED) {
      throw new AppError(httpStatus.BAD_REQUEST, "Sprint is not completed");
    }

    const existingPayment = await tx.payment.findUnique({
      where: {
        sprintId,
      },
    });

    if (existingPayment?.status === PaymentStatus.SUCCESS) {
      throw new AppError(httpStatus.BAD_REQUEST, "Sprint already paid");
    }

    let stripeClientId = client.payments[0]?.stripeCustomerId;

    if (!stripeClientId) {
      const client = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.userId,
        },
      });
      stripeClientId = client.id;
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: sprint.name,
            },
            unit_amount: Number(sprint.paymentAmount) * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer: stripeClientId,
      payment_method_types: ["card"],
      success_url: `${config.frontend_url}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.frontend_url}/payment/cancel?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        userId: user.userId,
        sprintId,
      },
    });

    if (existingPayment) {
      await tx.payment.update({
        where: {
          id: existingPayment.id,
        },
        data: {
          stripeCustomerId: stripeClientId,
          transactionId: session.id,
          status: PaymentStatus.PENDING,
          amount: sprint.paymentAmount,
        },
      });
    } else {
      await tx.payment.create({
        data: {
          sprintId,
          clientId: client.id,
          amount: sprint.paymentAmount,
          stripeCustomerId: stripeClientId,
          transactionId: session.id,
          status: PaymentStatus.PENDING,
        },
      });
    }
    return {
      sessionId: session.id,
      checkoutUrl: session.url,
    };
  });
  return {
    paymentUrl: transactionResult,
  };
};

const handleWebhook = async (payload: Buffer, signature: string) => {
  console.log("PAYMENT WEBHOOK SERVICE CALLED");

  const endPointSecret = config.stripe_webhook_secret;

  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    endPointSecret,
  );

  console.log("webhook received", event.type);

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object);

      break;

    default:
      // Unexpected event type
      console.log(`Unhandled event type ${event.type}.`);
  }
};

export const paymentService = {
  creareCheckoutSession,
  handleWebhook,
};
