import { companyRegistrationService } from "../services/company-registration.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";

export const companyRegistrationController = {
  create: asyncHandler(async (req, res) => {
    const data = await companyRegistrationService.create(req.user!.id, req.body);
    return sendSuccess(res, data, "Company registration created", 201);
  }),

  list: asyncHandler(async (req, res) => {
    const data = await companyRegistrationService.list(
      req.user!,
      req.query as never
    );
    return sendSuccess(res, data);
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await companyRegistrationService.getById(
      req.params.id,
      req.user!
    );
    return sendSuccess(res, data);
  }),

  update: asyncHandler(async (req, res) => {
    const data = await companyRegistrationService.update(
      req.params.id,
      req.user!,
      req.body
    );
    return sendSuccess(res, data, "Updated");
  }),

  submit: asyncHandler(async (req, res) => {
    const data = await companyRegistrationService.submit(
      req.params.id,
      req.user!.id
    );
    return sendSuccess(res, data, "Submitted");
  }),

  adminUpdateStatus: asyncHandler(async (req, res) => {
    const data = await companyRegistrationService.adminUpdateStatus(
      req.params.id,
      req.user!.id,
      req.body
    );
    return sendSuccess(res, data, "Status updated");
  }),

  remove: asyncHandler(async (req, res) => {
    const data = await companyRegistrationService.remove(
      req.params.id,
      req.user!
    );
    return sendSuccess(res, data, "Deleted");
  }),
};
