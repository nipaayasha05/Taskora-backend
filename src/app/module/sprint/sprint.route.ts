import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { sprintController } from "./sprint.controller";
import { validateRequest } from "../../middleware/validateRequest";
import {
  sprintCreateSchema,
  sprintTeamCreateSchema,
  sprintUpdateSchema,
} from "./sprint.validation";

const router = Router();

router.post(
  "/:organizationId/:projectId",
  auth(),
  validateRequest(sprintCreateSchema),
  sprintController.createSprint,
);

router.patch(
  "/:organizationId/:projectId/:sprintId",
  auth(),
  validateRequest(sprintUpdateSchema),
  sprintController.updateSprint,
);

router.post(
  "/:organizationId/:projectId/:sprintId",
  auth(),
  validateRequest(sprintTeamCreateSchema),
  sprintController.createSprintTeam,
);

export const sprintRoutes = router;
