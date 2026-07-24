import type { RoleName } from "@prisma/client";
import { paymentRepository } from "../repositories/payment.repository";
import { ForbiddenError, NotFoundError } from "../utils/AppError";
import { getPagination, toPaginated } from "../utils/pagination";
import { createAuditLog } from "./audit.service";

export const paymentService = {
  async listPayments(
    user: { id: string; role: RoleName },
    query: { page?: number; limit?: number }
  ) {
    const { skip, take, page, limit } = getPagination(query);
    const { items, total } = await paymentRepository.list({
      skip,
      take,
      payerId: user.role === "ADMIN" ? undefined : user.role === "FOUNDER" ? user.id : undefined,
      freelancerUserId:
        user.role === "FREELANCER" ? user.id : undefined,
    });
    return toPaginated(items, total, page, limit);
  },

  async listInvoices(
    user: { id: string; role: RoleName },
    query: { page?: number; limit?: number; status?: string }
  ) {
    const { skip, take, page, limit } = getPagination(query);
    const { items, total } = await paymentRepository.listInvoices({
      skip,
      take,
      customerId: user.role === "ADMIN" ? undefined : user.id,
      status: query.status as never,
    });
    return toPaginated(items, total, page, limit);
  },

  async getInvoice(id: string, user: { id: string; role: RoleName }) {
    const invoice = await paymentRepository.findInvoiceById(id);
    if (!invoice) throw new NotFoundError("Invoice not found");
    if (user.role !== "ADMIN" && invoice.customerId !== user.id) {
      throw new ForbiddenError("Not allowed");
    }
    return invoice;
  },

  async createInvoice(
    adminId: string,
    input: {
      customerId: string;
      projectId?: string;
      subtotal: number;
      tax?: number;
      currency?: string;
      dueDate?: Date;
      notes?: string;
      lineItems: unknown;
      status?: never;
    }
  ) {
    const tax = input.tax ?? 0;
    const total = input.subtotal + tax;
    const invoiceNumber = await paymentRepository.nextInvoiceNumber();

    const invoice = await paymentRepository.createInvoice({
      invoiceNumber,
      subtotal: input.subtotal,
      tax,
      total,
      currency: input.currency ?? "USD",
      dueDate: input.dueDate,
      notes: input.notes,
      lineItems: input.lineItems as never,
      status: input.status ?? "SENT",
      issuedAt: new Date(),
      customer: { connect: { id: input.customerId } },
      ...(input.projectId
        ? { project: { connect: { id: input.projectId } } }
        : {}),
    });

    await createAuditLog({
      userId: adminId,
      action: "CREATE",
      entityType: "Invoice",
      entityId: invoice.id,
    });

    return invoice;
  },
};
