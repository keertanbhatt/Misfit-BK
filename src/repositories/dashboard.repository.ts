import { prisma } from "../prisma";

export const dashboardRepository = {
  async founderStats(userId: string) {
    const [
      startups,
      projects,
      activeProjects,
      meetings,
      unreadNotifications,
      invoicesPending,
    ] = await Promise.all([
      prisma.startup.count({
        where: { founderId: userId, deletedAt: null },
      }),
      prisma.project.count({
        where: { ownerId: userId, deletedAt: null },
      }),
      prisma.project.count({
        where: { ownerId: userId, deletedAt: null, status: "ACTIVE" },
      }),
      prisma.meeting.count({
        where: {
          OR: [
            { organizerId: userId },
            { participants: { some: { userId } } },
          ],
        },
      }),
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
      prisma.invoice.count({
        where: {
          customerId: userId,
          status: { in: ["SENT", "OVERDUE", "DRAFT"] },
        },
      }),
    ]);

    return {
      startups,
      projects,
      activeProjects,
      meetings,
      unreadNotifications,
      invoicesPending,
    };
  },
};
