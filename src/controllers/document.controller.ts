import { documentService } from "../services/document.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";

export const documentController = {
  upload: asyncHandler(async (req, res) => {
    const data = await documentService.upload(
      req.user!,
      req.file,
      req.body as never
    );
    return sendSuccess(res, data, "Document uploaded", 201);
  }),

  list: asyncHandler(async (req, res) => {
    const data = await documentService.list(req.user!, req.query as never);
    return sendSuccess(res, data);
  }),

  remove: asyncHandler(async (req, res) => {
    const data = await documentService.remove(req.params.id, req.user!);
    return sendSuccess(res, data, "Document deleted");
  }),
};
