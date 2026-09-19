import { Router } from "express";

import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { projectController } from "./project.controller";
import {
  projectCreateSchema,
  projectTeamCreateSchema,
  projectUpdateSchema,
} from "./project.validation";

const router = Router();

router.post(
  "/:organizationId",
  auth(),
  validateRequest(projectCreateSchema),
  projectController.createProject,
);

router.patch(
  "/:organizationId/:projectId",
  auth(),
  validateRequest(projectUpdateSchema),
  projectController.updateProject,
);

router.post(
  "/:organizationId/:projectId",
  auth(),
  validateRequest(projectTeamCreateSchema),
  projectController.createProjectTeams,
);

router.get("/:organizationId/:projectId", auth(), projectController.getProject);

export const projectRoutes = router;
