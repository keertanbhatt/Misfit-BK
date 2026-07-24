import type { MeetingStatus, Prisma } from "@prisma/client";
import { prisma } from "../prisma";

export const meetingRepository = {
  create(data: Prisma.MeetingCreateInput) {
    return prisma.meeting.create({
      data,
      include: {
        participants: { include: { user: { include: { profile: true } } } },
        organizer: { include: { profile: true } },
      },
    });
  },

  findById(id: string) {
    return prisma.meeting.findUnique({
      where: { id },
      include: {
        participants: { include: { user: { include: { profile: true } } } },
        organizer: { include: { profile: true } },
      },
    });
  },

  update(id: string, data: Prisma.MeetingUpdateInput) {
    return prisma.meeting.update({
      where: { id },
      data,
      include: {
        participants: { include: { user: { include: { profile: true } } } },
        organizer: { include: { profile: true } },
      },
    });
  },

  remove(id: string) {
    return prisma.meeting.delete({ where: { id } });
  },

  async list(params: {
    skip: number;
    take: number;
    userId?: string;
    status?: MeetingStatus;
  }) {
    const where: Prisma.MeetingWhereInput = {
      ...(params.status ? { status: params.status } : {}),
      ...(params.userId
        ? {
            OR: [
              { organizerId: params.userId },
              { participants: { some: { userId: params.userId } } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      prisma.meeting.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { scheduledAt: "asc" },
        include: {
          participants: { include: { user: { include: { profile: true } } } },
          organizer: { include: { profile: true } },
        },
      }),
      prisma.meeting.count({ where }),
    ]);
    return { items, total };
  },

  replaceParticipants(meetingId: string, userIds: string[]) {
    return prisma.$transaction([
      prisma.meetingParticipant.deleteMany({ where: { meetingId } }),
      prisma.meetingParticipant.createMany({
        data: userIds.map((userId) => ({ meetingId, userId })),
        skipDuplicates: true,
      }),
    ]);
  },
};
