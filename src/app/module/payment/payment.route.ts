import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { paymentController } from "./payment.controller";

const router = Router();

router.post("/create", auth(), paymentController.createCheckoutSession);

router.post("/confirm", paymentController.handleWebhook);

export const paymentRoutes = router;
