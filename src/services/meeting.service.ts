import type { RoleName } from "@prisma/client";
import { meetingRepository } from "../repositories/meeting.repository";
import { ForbiddenError, NotFoundError } from "../utils/AppError";
import { getPagination, toPaginated } from "../utils/pagination";

export const meetingService = {
  async create(
    organizerId: string,
    input: {
      title: string;
      description?: string;
      type?: never;
      scheduledAt: Date;
      durationMin?: number;
      meetingUrl?: string;
      location?: string;
      startupId?: string;
      projectId?: string;
      participantIds?: string[];
      notes?: string;
    }
  ) {
    return meetingRepository.create({
      title: input.title,
      description: input.description,
      type: input.type ?? "OTHER",
      scheduledAt: input.scheduledAt,
      durationMin: input.durationMin ?? 30,
      meetingUrl: input.meetingUrl,
      location: input.location,
      notes: input.notes,
      organizer: { connect: { id: organizerId } },
      ...(input.startupId
        ? { startup: { connect: { id: input.startupId } } }
        : {}),
      ...(input.projectId
        ? { project: { connect: { id: input.projectId } } }
        : {}),
      participants: {
        create: (input.participantIds ?? []).map((userId) => ({
          user: { connect: { id: userId } },
        })),
      },
    });
  },

  async list(
    user: { id: string; role: RoleName },
    query: { page?: number; limit?: number; status?: string }
  ) {
    const { skip, take, page, limit } = getPagination(query);
    const { items, total } = await meetingRepository.list({
      skip,
      take,
      userId: user.role === "ADMIN" ? undefined : user.id,
      status: query.status as never,
    });
    return toPaginated(items, total, page, limit);
  },

  async getById(id: string, user: { id: string; role: RoleName }) {
    const meeting = await meetingRepository.findById(id);
    if (!meeting) throw new NotFoundError("Meeting not found");
    const isParticipant = meeting.participants.some(
      (p) => p.userId === user.id
    );
    if (
      user.role !== "ADMIN" &&
      meeting.organizerId !== user.id &&
      !isParticipant
    ) {
      throw new ForbiddenError("Not allowed");
    }
    return meeting;
  },

  async update(
    id: string,
    user: { id: string; role: RoleName },
    input: Record<string, unknown>
  ) {
    const meeting = await this.getById(id, user);
    if (user.role !== "ADMIN" && meeting.organizerId !== user.id) {
      throw new ForbiddenError("Only organizer can update");
    }

    const { participantIds, ...rest } = input as {
      participantIds?: string[];
    } & Record<string, unknown>;

    const updated = await meetingRepository.update(id, rest as never);
    if (participantIds) {
      await meetingRepository.replaceParticipants(id, participantIds);
      return meetingRepository.findById(id);
    }
    return updated;
  },

  async remove(id: string, user: { id: string; role: RoleName }) {
    const meeting = await this.getById(id, user);
    if (user.role !== "ADMIN" && meeting.organizerId !== user.id) {
      throw new ForbiddenError("Only organizer can delete");
    }
    await meetingRepository.remove(id);
    return { id };
  },
};
