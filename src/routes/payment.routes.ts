import { Router } from "express";
import { paymentController } from "../controllers/payment.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { validate } from "../middlewares/validate";
import {
  createInvoiceSchema,
  listInvoicesSchema,
  listPaymentsSchema,
} from "../validators/payment.validators";

const paymentsRouter = Router();
paymentsRouter.use(authenticate);
paymentsRouter.get(
  "/",
  validate(listPaymentsSchema, "query"),
  paymentController.listPayments
);

const invoicesRouter = Router();
invoicesRouter.use(authenticate);
invoicesRouter.get(
  "/",
  validate(listInvoicesSchema, "query"),
  paymentController.listInvoices
);
invoicesRouter.get("/:id", paymentController.getInvoice);
invoicesRouter.post(
  "/",
  authorize("ADMIN"),
  validate(createInvoiceSchema),
  paymentController.createInvoice
);

export { paymentsRouter, invoicesRouter };
