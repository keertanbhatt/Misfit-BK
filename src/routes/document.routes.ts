import { Router } from "express";
import { documentController } from "../controllers/document.controller";
import { authenticate } from "../middlewares/authenticate";
import { upload } from "../middlewares/upload";
import { validate } from "../middlewares/validate";
import {
  listDocumentsSchema,
  uploadDocumentMetaSchema,
} from "../validators/document.validators";

const router = Router();

router.use(authenticate);
router.get("/", validate(listDocumentsSchema, "query"), documentController.list);
router.post(
  "/upload",
  upload.single("file"),
  validate(uploadDocumentMetaSchema),
  documentController.upload
);
router.delete("/:id", documentController.remove);

export default router;
