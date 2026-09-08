import { Router } from "express";
import { teamController } from "./team.controller";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { teamCreateSchema } from "./team.validation";

const router = Router();

router.post(
  "/:organizationId",
  auth(),
  validateRequest(teamCreateSchema),
  teamController.createTeam,
);

export const teamRoutes = router;
