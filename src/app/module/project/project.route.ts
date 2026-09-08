import { Router } from "express";

import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { projectController } from "./project.controller";
import {
  projectCreateSchema,
  projectTeamCreateSchema,
} from "./project.validation";

const router = Router();

router.post(
  "/:organizationId",
  auth(),
  validateRequest(projectCreateSchema),
  projectController.createProject,
);

router.post(
  "/:organizationId/:projectId",
  auth(),
  validateRequest(projectTeamCreateSchema),
  projectController.createProjectTeams,
);

export const projectRoutes = router;
