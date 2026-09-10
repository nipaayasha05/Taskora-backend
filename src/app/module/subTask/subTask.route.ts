import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { subTaskCreateSchema } from "./subTask.validation";
import { subTaskController } from "./subTask.controller";

const router = Router();

router.post(
  "/:organizationId/:projectId/:sprintId/:taskId",
  auth(),
  validateRequest(subTaskCreateSchema),
  subTaskController.createSubTask,
);

export const subTaskRoutes = router;
