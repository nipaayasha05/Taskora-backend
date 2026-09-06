import { Router } from "express";
import { profileController } from "./profile.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { upload } from "../../lib/multer";
import { auth } from "../../middleware/checkAuth";

const router = Router();

router.post(
  "/profile",
  auth(),
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "avatar", maxCount: 1 },
  ]),
  profileController.profileCreate,
);

router.patch(
  "/profile",
  auth(),
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "avatar", maxCount: 1 },
  ]),
  profileController.profileUpdate,
);

export const profileRoutes = router;
