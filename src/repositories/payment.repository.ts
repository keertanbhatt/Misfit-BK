import type { InvoiceStatus, Prisma } from "@prisma/client";
import { prisma } from "../prisma";

export const paymentRepository = {
  async list(params: {
    skip: number;
    take: number;
    payerId?: string;
    freelancerUserId?: string;
  }) {
    const where: Prisma.PaymentWhereInput = {
      ...(params.payerId ? { payerId: params.payerId } : {}),
      ...(params.freelancerUserId
        ? { freelancer: { userId: params.freelancerUserId } }
        : {}),
    };
    const [items, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
        include: { project: true, invoice: true },
      }),
      prisma.payment.count({ where }),
    ]);
    return { items, total };
  },

  createInvoice(data: Prisma.InvoiceCreateInput) {
    return prisma.invoice.create({ data });
  },

  findInvoiceById(id: string) {
    return prisma.invoice.findUnique({
      where: { id },
      include: { payments: true, project: true, customer: { include: { profile: true } } },
    });
  },

  async listInvoices(params: {
    skip: number;
    take: number;
    customerId?: string;
    status?: InvoiceStatus;
  }) {
    const where: Prisma.InvoiceWhereInput = {
      ...(params.customerId ? { customerId: params.customerId } : {}),
      ...(params.status ? { status: params.status } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
        include: { project: true },
      }),
      prisma.invoice.count({ where }),
    ]);
    return { items, total };
  },

  async nextInvoiceNumber() {
    const count = await prisma.invoice.count();
    const year = new Date().getFullYear();
    return `INV-${year}-${String(count + 1).padStart(5, "0")}`;
  },
};
