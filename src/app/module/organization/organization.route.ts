import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { organizationController } from "./organization.controller";
import { SystemRole } from "../../../../prisma/generated/prisma/enums";
import { upload } from "../../lib/multer";

const router = Router();

router.post(
  "/",
  auth(SystemRole.USER),
  upload.fields([{ name: "logo", maxCount: 1 }]),
  organizationController.createOrganization,
);

router.patch(
  "/:organizationId/status",
  auth(SystemRole.ADMIN),
  organizationController.updateOrganization,
);

router.post(
  "/:organizationId/join",
  auth(),
  organizationController.joinOrganizationCreate,
);

router.patch(
  "/:organizationId/join",
  auth(),
  organizationController.updateJoinOrganization,
);

export const organizationRoutes = router;
