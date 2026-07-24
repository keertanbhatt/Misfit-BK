import type { AssignmentStatus, RoleName } from "@prisma/client";
import { assignmentRepository } from "../repositories/assignment.repository";
import { freelancerRepository } from "../repositories/freelancer.repository";
import { projectRepository } from "../repositories/project.repository";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../utils/AppError";
import { getPagination, toPaginated } from "../utils/pagination";
import { createAuditLog } from "./audit.service";

export const assignmentService = {
  async create(
    user: { id: string; role: RoleName },
    input: {
      projectId: string;
      freelancerId: string;
      roleTitle?: string;
      rate?: number;
      currency?: string;
      startDate?: Date;
      endDate?: Date;
      notes?: string;
    }
  ) {
    const project = await projectRepository.findById(input.projectId);
    if (!project) throw new NotFoundError("Project not found");
    if (user.role !== "ADMIN" && project.ownerId !== user.id) {
      throw new ForbiddenError("Not allowed");
    }

    const freelancer = await freelancerRepository.findById(input.freelancerId);
    if (!freelancer) throw new NotFoundError("Freelancer not found");

    try {
      const assignment = await assignmentRepository.create({
        roleTitle: input.roleTitle,
        rate: input.rate,
        currency: input.currency ?? "USD",
        startDate: input.startDate,
        endDate: input.endDate,
        notes: input.notes,
        project: { connect: { id: input.projectId } },
        freelancer: { connect: { id: input.freelancerId } },
      });

      await createAuditLog({
        userId: user.id,
        action: "CREATE",
        entityType: "Assignment",
        entityId: assignment.id,
      });

      return assignment;
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error as { code: string }).code === "P2002"
      ) {
        throw new ConflictError("Freelancer already assigned to this project");
      }
      throw error;
    }
  },

  async list(
    user: { id: string; role: RoleName },
    query: {
      page?: number;
      limit?: number;
      status?: string;
      projectId?: string;
    }
  ) {
    const { skip, take, page, limit } = getPagination(query);
    let freelancerId: string | undefined;
    let projectOwnerId: string | undefined;

    if (user.role === "FREELANCER") {
      const freelancer = await freelancerRepository.findByUserId(user.id);
      freelancerId = freelancer?.id;
    } else if (user.role === "FOUNDER") {
      projectOwnerId = user.id;
    }

    const { items, total } = await assignmentRepository.list({
      skip,
      take,
      status: query.status as never,
      projectId: query.projectId,
      freelancerId,
      projectOwnerId,
    });
    return toPaginated(items, total, page, limit);
  },

  async updateStatus(
    id: string,
    user: { id: string; role: RoleName },
    status: AssignmentStatus
  ) {
    const assignment = await assignmentRepository.findById(id);
    if (!assignment) throw new NotFoundError("Assignment not found");

    if (user.role === "FREELANCER") {
      const freelancer = await freelancerRepository.findByUserId(user.id);
      if (!freelancer || freelancer.id !== assignment.freelancerId) {
        throw new ForbiddenError("Not allowed");
      }
    } else if (user.role === "FOUNDER") {
      if (assignment.project.ownerId !== user.id) {
        throw new ForbiddenError("Not allowed");
      }
    } else if (user.role !== "ADMIN") {
      throw new ForbiddenError("Not allowed");
    }

    return assignmentRepository.update(id, { status });
  },
};
