import type { RoleName } from "@prisma/client";
import { companyRegistrationRepository } from "../repositories/company-registration.repository";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../utils/AppError";
import { getPagination, toPaginated } from "../utils/pagination";
import { createAuditLog } from "./audit.service";

export const companyRegistrationService = {
  async create(userId: string, input: Record<string, unknown>) {
    return companyRegistrationRepository.create({
      type: input.type as never,
      legalName: input.legalName as string,
      tradeName: input.tradeName as string | undefined,
      panNumber: input.panNumber as string | undefined,
      gstNumber: input.gstNumber as string | undefined,
      cinNumber: input.cinNumber as string | undefined,
      trademarkNumber: input.trademarkNumber as string | undefined,
      startupIndiaId: input.startupIndiaId as string | undefined,
      notes: input.notes as string | undefined,
      user: { connect: { id: userId } },
      ...(input.startupId
        ? { startup: { connect: { id: input.startupId as string } } }
        : {}),
    });
  },

  async list(
    user: { id: string; role: RoleName },
    query: { page?: number; limit?: number; status?: string }
  ) {
    const { skip, take, page, limit } = getPagination(query);
    const { items, total } = await companyRegistrationRepository.list({
      skip,
      take,
      userId: user.role === "ADMIN" ? undefined : user.id,
      status: query.status as never,
    });
    return toPaginated(items, total, page, limit);
  },

  async getById(id: string, user: { id: string; role: RoleName }) {
    const item = await companyRegistrationRepository.findById(id);
    if (!item) throw new NotFoundError("Company registration not found");
    if (user.role !== "ADMIN" && item.userId !== user.id) {
      throw new ForbiddenError("Not allowed");
    }
    return item;
  },

  async update(
    id: string,
    user: { id: string; role: RoleName },
    input: Record<string, unknown>
  ) {
    const item = await this.getById(id, user);
    if (
      user.role !== "ADMIN" &&
      !["DRAFT", "DOCUMENTS_PENDING", "REJECTED"].includes(item.status)
    ) {
      throw new ValidationError("Cannot edit in current status");
    }
    return companyRegistrationRepository.update(id, input as never);
  },

  async submit(id: string, userId: string) {
    const item = await companyRegistrationRepository.findById(id);
    if (!item || item.userId !== userId) {
      throw new NotFoundError("Company registration not found");
    }
    if (!["DRAFT", "REJECTED", "DOCUMENTS_PENDING"].includes(item.status)) {
      throw new ValidationError("Cannot submit in current status");
    }
    return companyRegistrationRepository.update(id, {
      status: "SUBMITTED",
      submittedAt: new Date(),
    });
  },

  async adminUpdateStatus(
    id: string,
    adminId: string,
    input: { status: never; adminNotes?: string }
  ) {
    const item = await companyRegistrationRepository.findById(id);
    if (!item) throw new NotFoundError("Company registration not found");

    const updated = await companyRegistrationRepository.update(id, {
      status: input.status,
      adminNotes: input.adminNotes,
      ...(input.status === "COMPLETED" ? { completedAt: new Date() } : {}),
    });

    await createAuditLog({
      userId: adminId,
      action: "STATUS_CHANGE",
      entityType: "CompanyRegistration",
      entityId: id,
      metadata: { status: input.status },
    });

    return updated;
  },

  async remove(id: string, user: { id: string; role: RoleName }) {
    await this.getById(id, user);
    await companyRegistrationRepository.softDelete(id);
    return { id };
  },
};
