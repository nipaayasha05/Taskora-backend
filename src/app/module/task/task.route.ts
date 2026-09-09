import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { taskController } from "./task.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { taskCreateSchema, taskUpdateSchema } from "./task.validation";

const router = Router();
router.post(
  "/:organizationId/:projectId/:sprintId",
  auth(),
  validateRequest(taskCreateSchema),
  taskController.createTask,
);

router.patch(
  "/:organizationId/:projectId/:sprintId/:taskId",
  auth(),
  validateRequest(taskUpdateSchema),
  taskController.updateTask,
);

export const taskRoutes = router;
