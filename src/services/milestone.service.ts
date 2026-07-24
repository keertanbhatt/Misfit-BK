import type { RoleName } from "@prisma/client";
import { milestoneRepository } from "../repositories/milestone.repository";
import { projectRepository } from "../repositories/project.repository";
import { ForbiddenError, NotFoundError } from "../utils/AppError";

async function assertProjectAccess(
  projectId: string,
  user: { id: string; role: RoleName }
) {
  const project = await projectRepository.findById(projectId);
  if (!project) throw new NotFoundError("Project not found");
  if (user.role !== "ADMIN" && project.ownerId !== user.id) {
    throw new ForbiddenError("Not allowed");
  }
  return project;
}

export const milestoneService = {
  async create(
    projectId: string,
    user: { id: string; role: RoleName },
    input: {
      title: string;
      description?: string;
      status?: never;
      dueDate?: Date;
      sortOrder?: number;
    }
  ) {
    await assertProjectAccess(projectId, user);
    return milestoneRepository.create({
      title: input.title,
      description: input.description,
      status: input.status ?? "PENDING",
      dueDate: input.dueDate,
      sortOrder: input.sortOrder ?? 0,
      project: { connect: { id: projectId } },
    });
  },

  async list(projectId: string, user: { id: string; role: RoleName }) {
    await assertProjectAccess(projectId, user);
    return milestoneRepository.listByProject(projectId);
  },

  async update(
    id: string,
    user: { id: string; role: RoleName },
    input: Record<string, unknown>
  ) {
    const milestone = await milestoneRepository.findById(id);
    if (!milestone) throw new NotFoundError("Milestone not found");
    await assertProjectAccess(milestone.projectId, user);
    const data = { ...input };
    if (input.status === "COMPLETED") {
      (data as { completedAt?: Date }).completedAt = new Date();
    }
    return milestoneRepository.update(id, data as never);
  },

  async remove(id: string, user: { id: string; role: RoleName }) {
    const milestone = await milestoneRepository.findById(id);
    if (!milestone) throw new NotFoundError("Milestone not found");
    await assertProjectAccess(milestone.projectId, user);
    await milestoneRepository.remove(id);
    return { id };
  },
};
