import type { RoleName } from "@prisma/client";
import { startupRepository } from "../repositories/startup.repository";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../utils/AppError";
import { getPagination, toPaginated } from "../utils/pagination";
import { uniqueSlug } from "../utils/slug";
import type {
  CreateStartupInput,
  UpdateStartupInput,
} from "../validators/startup.validators";
import { createAuditLog } from "./audit.service";

export const startupService = {
  async create(founderId: string, input: CreateStartupInput) {
    const slug = uniqueSlug(input.name);
    const startup = await startupRepository.create({
      name: input.name,
      slug,
      tagline: input.tagline,
      industry: input.industry,
      description: input.description,
      budgetMin: input.budgetMin,
      budgetMax: input.budgetMax,
      currency: input.currency ?? "USD",
      timelineWeeks: input.timelineWeeks,
      requiredServices: input.requiredServices,
      website: input.website,
      pitchDeckUrl: input.pitchDeckUrl,
      founder: { connect: { id: founderId } },
    });

    await createAuditLog({
      userId: founderId,
      action: "CREATE",
      entityType: "Startup",
      entityId: startup.id,
    });

    return startup;
  },

  async list(
    query: {
      page?: number;
      limit?: number;
      status?: string;
      industry?: string;
      search?: string;
      mine?: boolean;
    },
    user?: { id: string; role: RoleName }
  ) {
    const { skip, take, page, limit } = getPagination(query);
    const founderId =
      query.mine && user
        ? user.id
        : user?.role === "ADMIN"
          ? undefined
          : user?.id;

    // Public/list: founders see own; admins see all unless mine; freelancers see approved
    const status =
      (query.status as never) ??
      (user?.role === "FREELANCER" && !query.mine
        ? ("APPROVED" as const)
        : undefined);

    const { items, total } = await startupRepository.list({
      skip,
      take,
      founderId:
        user?.role === "ADMIN" && !query.mine ? undefined : founderId,
      status: status as never,
      industry: query.industry as never,
      search: query.search,
    });

    return toPaginated(items, total, page, limit);
  },

  async getById(id: string, user?: { id: string; role: RoleName }) {
    const startup = await startupRepository.findById(id);
    if (!startup) throw new NotFoundError("Startup not found");

    if (
      user?.role !== "ADMIN" &&
      startup.founderId !== user?.id &&
      !["APPROVED", "IN_PROGRESS", "COMPLETED"].includes(startup.status)
    ) {
      throw new ForbiddenError("Not allowed to view this startup");
    }

    return startup;
  },

  async update(
    id: string,
    userId: string,
    role: RoleName,
    input: UpdateStartupInput
  ) {
    const startup = await startupRepository.findById(id);
    if (!startup) throw new NotFoundError("Startup not found");
    if (role !== "ADMIN" && startup.founderId !== userId) {
      throw new ForbiddenError("Not allowed to update this startup");
    }
    if (
      role !== "ADMIN" &&
      !["DRAFT", "REJECTED"].includes(startup.status)
    ) {
      throw new ValidationError("Only draft/rejected startups can be edited");
    }

    return startupRepository.update(id, {
      ...input,
      budgetMin: input.budgetMin,
      budgetMax: input.budgetMax,
    });
  },

  async remove(id: string, userId: string, role: RoleName) {
    const startup = await startupRepository.findById(id);
    if (!startup) throw new NotFoundError("Startup not found");
    if (role !== "ADMIN" && startup.founderId !== userId) {
      throw new ForbiddenError("Not allowed to delete this startup");
    }
    await startupRepository.softDelete(id);
    return { id };
  },

  async submit(id: string, userId: string) {
    const startup = await startupRepository.findById(id);
    if (!startup) throw new NotFoundError("Startup not found");
    if (startup.founderId !== userId) {
      throw new ForbiddenError("Not allowed");
    }
    if (!["DRAFT", "REJECTED"].includes(startup.status)) {
      throw new ValidationError("Startup cannot be submitted in current status");
    }
    return startupRepository.update(id, { status: "SUBMITTED" });
  },

  async review(
    id: string,
    adminId: string,
    input: { status: "APPROVED" | "REJECTED" | "UNDER_REVIEW"; rejectionReason?: string }
  ) {
    const startup = await startupRepository.findById(id);
    if (!startup) throw new NotFoundError("Startup not found");

    const updated = await startupRepository.update(id, {
      status: input.status,
      rejectionReason:
        input.status === "REJECTED" ? input.rejectionReason ?? null : null,
      reviewedAt: new Date(),
      reviewedById: adminId,
    });

    await createAuditLog({
      userId: adminId,
      action: "STATUS_CHANGE",
      entityType: "Startup",
      entityId: id,
      metadata: { status: input.status },
    });

    return updated;
  },
};
