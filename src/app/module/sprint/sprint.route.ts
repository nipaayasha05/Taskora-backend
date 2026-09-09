import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { sprintController } from "./sprint.controller";
import { validateRequest } from "../../middleware/validateRequest";
import {
  sprintCreateSchema,
  sprintTeamCreateSchema,
} from "./sprint.validation";

const router = Router();

router.post(
  "/:organizationId/:projectId",
  auth(),
  validateRequest(sprintCreateSchema),
  sprintController.createSprint,
);

router.post(
  "/:organizationId/:projectId/:sprintId",
  auth(),
  validateRequest(sprintTeamCreateSchema),
  sprintController.createSprintTeam,
);

export const sprintRoutes = router;
