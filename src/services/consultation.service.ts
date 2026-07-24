import type { RoleName } from "@prisma/client";
import { consultationRepository } from "../repositories/consultation.repository";
import { getPagination, toPaginated } from "../utils/pagination";

export const consultationService = {
  async create(
    userId: string,
    input: {
      topic: string;
      description: string;
      startupId?: string;
      preferredAt?: Date;
    }
  ) {
    return consultationRepository.create({
      topic: input.topic,
      description: input.description,
      preferredAt: input.preferredAt,
      user: { connect: { id: userId } },
      ...(input.startupId
        ? { startup: { connect: { id: input.startupId } } }
        : {}),
    });
  },

  async list(
    user: { id: string; role: RoleName },
    query: { page?: number; limit?: number }
  ) {
    const { skip, take, page, limit } = getPagination(query);
    const { items, total } = await consultationRepository.list({
      skip,
      take,
      userId: user.role === "ADMIN" ? undefined : user.id,
    });
    return toPaginated(items, total, page, limit);
  },
};
