import Stripe from "stripe";
import { prisma } from "../lib/prisma";
import { PaymentStatus } from "../../../prisma/generated/prisma/enums";

export const handleCheckoutCompleted = async (
  session: Stripe.Checkout.Session,
) => {
  const userId = session.metadata?.userId;

  const stripeCustomerId = session.customer as string;
  const transactionId = session.payment_intent as string;
  const sprintId = session.metadata?.sprintId as string;

  if (!userId || !sprintId) {
    console.log("Missing metadata", session.id);
    return;
  }

  await prisma.payment.update({
    where: {
      sprintId,
    },
    data: {
      stripeCustomerId,
      transactionId,
      paidAt: new Date(),
      status: PaymentStatus.SUCCESS,
    },
  });
};
