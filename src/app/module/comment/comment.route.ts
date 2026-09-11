import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { commentController } from "./comment.controller";
import { commentCreateSchema } from "./comment.validation";

const router = Router();

router.post(
  "/:organizationId/:projectId/:sprintId/:taskId",
  auth(),
  validateRequest(commentCreateSchema),
  commentController.createComment,
);

export const commentRoutes = router;
