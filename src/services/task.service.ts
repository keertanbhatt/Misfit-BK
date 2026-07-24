import type { RoleName } from "@prisma/client";
import { projectRepository } from "../repositories/project.repository";
import { taskRepository } from "../repositories/task.repository";
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

export const taskService = {
  async create(
    projectId: string,
    user: { id: string; role: RoleName },
    input: {
      title: string;
      description?: string;
      milestoneId?: string;
      assigneeId?: string;
      status?: never;
      priority?: never;
      dueDate?: Date;
      sortOrder?: number;
    }
  ) {
    await assertProjectAccess(projectId, user);
    return taskRepository.create({
      title: input.title,
      description: input.description,
      status: input.status ?? "TODO",
      priority: input.priority ?? "MEDIUM",
      dueDate: input.dueDate,
      sortOrder: input.sortOrder ?? 0,
      project: { connect: { id: projectId } },
      creator: { connect: { id: user.id } },
      ...(input.milestoneId
        ? { milestone: { connect: { id: input.milestoneId } } }
        : {}),
      ...(input.assigneeId
        ? { assignee: { connect: { id: input.assigneeId } } }
        : {}),
    });
  },

  async list(
    projectId: string,
    user: { id: string; role: RoleName },
    filters?: { status?: string; assigneeId?: string }
  ) {
    await assertProjectAccess(projectId, user);
    return taskRepository.listByProject(projectId, {
      status: filters?.status as never,
      assigneeId: filters?.assigneeId,
    });
  },

  async getById(id: string, user: { id: string; role: RoleName }) {
    const task = await taskRepository.findById(id);
    if (!task) throw new NotFoundError("Task not found");
    await assertProjectAccess(task.projectId, user);
    return task;
  },

  async update(
    id: string,
    user: { id: string; role: RoleName },
    input: Record<string, unknown>
  ) {
    const task = await this.getById(id, user);
    const data: Record<string, unknown> = { ...input };
    if (input.status === "DONE" && !task.completedAt) {
      data.completedAt = new Date();
    }
    return taskRepository.update(task.id, data as never);
  },

  async remove(id: string, user: { id: string; role: RoleName }) {
    const task = await this.getById(id, user);
    await taskRepository.softDelete(task.id);
    return { id: task.id };
  },
};
