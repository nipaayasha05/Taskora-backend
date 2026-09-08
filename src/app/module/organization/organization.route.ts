import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { organizationController } from "./organization.controller";
import { SystemRole } from "../../../../prisma/generated/prisma/enums";
import { upload } from "../../lib/multer";
import {
  organizationJoinSchema,
  organizationJoinUpdateSchema,
  organizationMemberUpdateSchema,
} from "./organization.validate";
import { validateRequest } from "../../middleware/validateRequest";

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
  validateRequest(organizationJoinSchema),
  organizationController.joinOrganizationCreate,
);

router.patch(
  "/:organizationId/join",
  auth(),
  validateRequest(organizationJoinUpdateSchema),
  organizationController.updateJoinOrganization,
);

router.patch(
  "/:organizationId/members/:memberId",
  auth(),
  validateRequest(organizationMemberUpdateSchema),
  organizationController.updateOrganizationMember,
);

export const organizationRoutes = router;
