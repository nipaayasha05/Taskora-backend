import { Router } from "express";
import { teamController } from "./team.controller";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { teamCreateSchema, teamMemberCreateSchema } from "./team.validation";

const router = Router();

router.post(
  "/:organizationId",
  auth(),
  validateRequest(teamCreateSchema),
  teamController.createTeam,
);

router.post(
  "/:organizationId/:teamId/members",
  auth(),
  validateRequest(teamMemberCreateSchema),
  teamController.createTeamMember,
);

export const teamRoutes = router;
