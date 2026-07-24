import type { RoleName } from "@prisma/client";
import { projectRepository } from "../repositories/project.repository";
import { ForbiddenError, NotFoundError } from "../utils/AppError";
import { getPagination, toPaginated } from "../utils/pagination";
import { uniqueSlug } from "../utils/slug";
import { createAuditLog } from "./audit.service";

export const projectService = {
  async create(
    ownerId: string,
    input: {
      name: string;
      description?: string;
      startupId?: string;
      status?: never;
      startDate?: Date;
      dueDate?: Date;
    }
  ) {
    const project = await projectRepository.create({
      name: input.name,
      slug: uniqueSlug(input.name),
      description: input.description,
      status: input.status ?? "PLANNING",
      startDate: input.startDate,
      dueDate: input.dueDate,
      owner: { connect: { id: ownerId } },
      ...(input.startupId
        ? { startup: { connect: { id: input.startupId } } }
        : {}),
    });

    await createAuditLog({
      userId: ownerId,
      action: "CREATE",
      entityType: "Project",
      entityId: project.id,
    });

    return project;
  },

  async list(
    query: {
      page?: number;
      limit?: number;
      status?: string;
      startupId?: string;
    },
    user: { id: string; role: RoleName }
  ) {
    const { skip, take, page, limit } = getPagination(query);
    const { items, total } = await projectRepository.list({
      skip,
      take,
      ownerId: user.role === "ADMIN" ? undefined : user.id,
      status: query.status as never,
      startupId: query.startupId,
    });
    return toPaginated(items, total, page, limit);
  },

  async getById(id: string, user: { id: string; role: RoleName }) {
    const project = await projectRepository.findById(id);
    if (!project) throw new NotFoundError("Project not found");
    if (user.role !== "ADMIN" && project.ownerId !== user.id) {
      throw new ForbiddenError("Not allowed");
    }
    return project;
  },

  async update(
    id: string,
    user: { id: string; role: RoleName },
    input: Record<string, unknown>
  ) {
    const project = await this.getById(id, user);
    return projectRepository.update(project.id, input as never);
  },

  async updateProgress(
    id: string,
    user: { id: string; role: RoleName },
    progress: number
  ) {
    await this.getById(id, user);
    return projectRepository.update(id, {
      progress,
      ...(progress >= 100
        ? { status: "COMPLETED", completedAt: new Date() }
        : {}),
    });
  },

  async remove(id: string, user: { id: string; role: RoleName }) {
    await this.getById(id, user);
    await projectRepository.softDelete(id);
    return { id };
  },
};
