import { Router } from "express";
import { teamController } from "./team.controller";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import {
  teamCreateSchema,
  teamMemberCreateSchema,
  teamUpdateSchema,
} from "./team.validation";

const router = Router();

router.post(
  "/:organizationId",
  auth(),
  validateRequest(teamCreateSchema),
  teamController.createTeam,
);

router.get("/:organizationId", auth(), teamController.getTeamList);

router.patch(
  "/:organizationId/:teamId",
  auth(),
  validateRequest(teamUpdateSchema),
  teamController.updateTeam,
);

router.post(
  "/:organizationId/:teamId/members",
  auth(),
  validateRequest(teamMemberCreateSchema),
  teamController.createTeamMember,
);

router.get(
  "/:organizationId/:teamId/members",
  auth(),
  teamController.getTeamMemberList,
);

router.delete(
  "/:organizationId/:teamId/members/:userId",
  auth(),
  teamController.removeTeamMember,
);

export const teamRoutes = router;
