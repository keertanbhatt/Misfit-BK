import { paymentService } from "../services/payment.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";

export const paymentController = {
  listPayments: asyncHandler(async (req, res) => {
    const data = await paymentService.listPayments(
      req.user!,
      req.query as never
    );
    return sendSuccess(res, data);
  }),

  listInvoices: asyncHandler(async (req, res) => {
    const data = await paymentService.listInvoices(
      req.user!,
      req.query as never
    );
    return sendSuccess(res, data);
  }),

  getInvoice: asyncHandler(async (req, res) => {
    const data = await paymentService.getInvoice(req.params.id, req.user!);
    return sendSuccess(res, data);
  }),

  createInvoice: asyncHandler(async (req, res) => {
    const data = await paymentService.createInvoice(req.user!.id, req.body);
    return sendSuccess(res, data, "Invoice created", 201);
  }),
};
