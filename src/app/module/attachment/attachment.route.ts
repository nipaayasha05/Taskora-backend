import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { attachmentController } from "./attachment.controller";
import { attachmentCreateSchema } from "./attachment.validation";
import { upload } from "../../lib/multer";

const router = Router();

router.post(
  "/:organizationId/:projectId/:sprintId/:taskId",
  auth(),
  upload.fields([{ name: "attachment", maxCount: 1 }]),
  //   validateRequest(attachmentCreateSchema),
  attachmentController.createAttachment,
);

export const attachmentRoutes = router;
