import type { RoleName } from "@prisma/client";
import { supportRepository } from "../repositories/support.repository";
import { ForbiddenError, NotFoundError } from "../utils/AppError";
import { getPagination, toPaginated } from "../utils/pagination";

export const supportService = {
  async create(
    userId: string,
    input: {
      subject: string;
      description: string;
      priority?: never;
      category?: string;
    }
  ) {
    return supportRepository.create({
      subject: input.subject,
      description: input.description,
      priority: input.priority ?? "MEDIUM",
      category: input.category,
      requester: { connect: { id: userId } },
    });
  },

  async list(
    user: { id: string; role: RoleName },
    query: { page?: number; limit?: number }
  ) {
    const { skip, take, page, limit } = getPagination(query);
    const { items, total } = await supportRepository.list({
      skip,
      take,
      requesterId: user.role === "ADMIN" ? undefined : user.id,
    });
    return toPaginated(items, total, page, limit);
  },

  async getById(id: string, user: { id: string; role: RoleName }) {
    const ticket = await supportRepository.findById(id);
    if (!ticket) throw new NotFoundError("Support ticket not found");
    if (user.role !== "ADMIN" && ticket.requesterId !== user.id) {
      throw new ForbiddenError("Not allowed");
    }
    return ticket;
  },
};
