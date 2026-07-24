import type { Prisma, UserStatus } from "@prisma/client";
import { prisma } from "../prisma";

export const adminRepository = {
  async analytics() {
    const [
      users,
      startups,
      projects,
      freelancers,
      consultations,
      supportTickets,
      payments,
      invoices,
      assignments,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.startup.count({ where: { deletedAt: null } }),
      prisma.project.count({ where: { deletedAt: null } }),
      prisma.freelancer.count({ where: { deletedAt: null } }),
      prisma.consultation.count(),
      prisma.supportTicket.count(),
      prisma.payment.count(),
      prisma.invoice.count(),
      prisma.assignment.count(),
    ]);

    const startupsByStatus = await prisma.startup.groupBy({
      by: ["status"],
      where: { deletedAt: null },
      _count: true,
    });

    const usersByRole = await prisma.user.groupBy({
      by: ["roleId"],
      where: { deletedAt: null },
      _count: true,
    });

    return {
      counts: {
        users,
        startups,
        projects,
        freelancers,
        consultations,
        supportTickets,
        payments,
        invoices,
        assignments,
      },
      startupsByStatus,
      usersByRole,
    };
  },

  async listUsers(params: {
    skip: number;
    take: number;
    status?: UserStatus;
    search?: string;
    role?: string;
  }) {
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(params.status ? { status: params.status } : {}),
      ...(params.role ? { role: { name: params.role as never } } : {}),
      ...(params.search
        ? {
            OR: [
              { email: { contains: params.search, mode: "insensitive" } },
              {
                profile: {
                  OR: [
                    {
                      firstName: {
                        contains: params.search,
                        mode: "insensitive",
                      },
                    },
                    {
                      lastName: {
                        contains: params.search,
                        mode: "insensitive",
                      },
                    },
                  ],
                },
              },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
        include: { role: true, profile: true, freelancer: true },
      }),
      prisma.user.count({ where }),
    ]);
    return {
      items: items.map(({ passwordHash: _, ...u }) => u),
      total,
    };
  },

  async listStartups(params: {
    skip: number;
    take: number;
    status?: string;
  }) {
    const where: Prisma.StartupWhereInput = {
      deletedAt: null,
      ...(params.status
        ? { status: params.status as import("@prisma/client").StartupStatus }
        : {}),
    };
    const [items, total] = await Promise.all([
      prisma.startup.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
        include: {
          founder: { include: { profile: true } },
          documents: {
            where: { deletedAt: null },
            select: { id: true, name: true, type: true, url: true, createdAt: true },
          },
          _count: { select: { projects: true, documents: true } },
        },
      }),
      prisma.startup.count({ where }),
    ]);
    return { items, total };
  },

  async listFreelancers(params: {
    skip: number;
    take: number;
    verified?: boolean;
  }) {
    const where: Prisma.FreelancerWhereInput = {
      deletedAt: null,
      ...(params.verified !== undefined
        ? { isVerified: params.verified }
        : {}),
    };
    const [items, total] = await Promise.all([
      prisma.freelancer.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
        include: {
          user: { include: { profile: true, role: true } },
          skills: { include: { skill: true } },
          _count: { select: { assignments: true, portfolio: true } },
        },
      }),
      prisma.freelancer.count({ where }),
    ]);
    return { items, total };
  },

  async listConsultations(params: { skip: number; take: number }) {
    const [items, total] = await Promise.all([
      prisma.consultation.findMany({
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
        include: {
          user: { include: { profile: true } },
          startup: true,
        },
      }),
      prisma.consultation.count(),
    ]);
    return { items, total };
  },

  async reportsSummary() {
    const [
      openTickets,
      pendingAssignments,
      submittedStartups,
      overdueInvoices,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.supportTicket.count({
        where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
      }),
      prisma.assignment.count({ where: { status: "PENDING" } }),
      prisma.startup.count({
        where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] }, deletedAt: null },
      }),
      prisma.invoice.count({
        where: {
          status: { in: ["SENT", "OVERDUE"] },
          dueDate: { lt: new Date() },
        },
      }),
      prisma.auditLog.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        include: { user: { include: { profile: true } } },
      }),
    ]);

    return {
      openTickets,
      pendingAssignments,
      submittedStartups,
      overdueInvoices,
      recentAuditLogs,
    };
  },

  async listProjects(params: { skip: number; take: number }) {
    const where = { deletedAt: null };
    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
        include: {
          owner: { include: { profile: true } },
          startup: true,
        },
      }),
      prisma.project.count({ where }),
    ]);
    return { items, total };
  },

  async listFounders(params: { skip: number; take: number }) {
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      role: { name: "FOUNDER" },
    };
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
        include: { role: true, profile: true },
      }),
      prisma.user.count({ where }),
    ]);
    return {
      items: items.map(({ passwordHash: _, ...u }) => u),
      total,
    };
  },

  async listDocuments(params: { skip: number; take: number }) {
    const where = { deletedAt: null };
    const [items, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
        include: {
          uploader: { include: { profile: true } },
        },
      }),
      prisma.document.count({ where }),
    ]);
    return { items, total };
  },

  async updateUserStatus(id: string, status: UserStatus) {
    const user = await prisma.user.update({
      where: { id },
      data: { status },
      include: { role: true, profile: true, freelancer: true },
    });
    const { passwordHash: _, ...safe } = user;
    return safe;
  },

  async listPendingApprovals(params: { skip: number; take: number }) {
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      status: { in: ["PENDING_APPROVAL", "PENDING_VERIFICATION"] },
      role: { name: { in: ["FOUNDER", "FREELANCER"] } },
    };
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
        include: {
          role: true,
          profile: true,
          freelancer: {
            include: {
              skills: { include: { skill: true } },
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);
    return {
      items: items.map(({ passwordHash: _, ...u }) => u),
      total,
    };
  },

  async getUserDetail(id: string) {
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        role: true,
        profile: true,
        freelancer: {
          include: {
            skills: { include: { skill: true } },
            experiences: true,
            portfolio: true,
          },
        },
        startups: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!user) return null;
    const { passwordHash: _, ...safe } = user;
    return safe;
  },

  async approveRegistration(id: string) {
    const existing = await prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: { role: true, freelancer: true },
    });
    if (!existing) return null;
    if (
      !["PENDING_APPROVAL", "PENDING_VERIFICATION"].includes(existing.status)
    ) {
      // still allow activate if already inactive/rejected re-review
      if (existing.status === "ACTIVE") return existing;
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        status: "ACTIVE",
        emailVerifiedAt: existing.emailVerifiedAt ?? new Date(),
        ...(existing.role.name === "FREELANCER" && existing.freelancer
          ? {
              freelancer: {
                update: { isVerified: true },
              },
            }
          : {}),
      },
      include: {
        role: true,
        profile: true,
        freelancer: true,
      },
    });

    await prisma.notification.create({
      data: {
        userId: id,
        type: "SYSTEM",
        title: "Account approved",
        body: "Welcome to Misfit — your account has been approved. You now have full access.",
        link:
          existing.role.name === "FREELANCER" ? "/freelancer" : "/app",
      },
    });

    const { passwordHash: _, ...safe } = user;
    return safe;
  },

  async rejectRegistration(id: string, reason?: string) {
    const existing = await prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: { role: true },
    });
    if (!existing) return null;

    const user = await prisma.user.update({
      where: { id },
      data: { status: "INACTIVE" },
      include: { role: true, profile: true, freelancer: true },
    });

    await prisma.notification.create({
      data: {
        userId: id,
        type: "SYSTEM",
        title: "Registration declined",
        body:
          reason?.trim() ||
          "Your Misfit registration was not approved. Contact support if you have questions.",
      },
    });

    const { passwordHash: _, ...safe } = user;
    return safe;
  },

  async getStartupDetail(id: string) {
    return prisma.startup.findFirst({
      where: { id, deletedAt: null },
      include: {
        founder: { include: { profile: true, role: true } },
        documents: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
        },
        projects: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  },

  async updateStartupStatus(
    id: string,
    data: {
      status: import("@prisma/client").StartupStatus;
      rejectionReason?: string | null;
      reviewedById: string;
    }
  ) {
    return prisma.startup.update({
      where: { id },
      data: {
        status: data.status,
        rejectionReason:
          data.status === "REJECTED" ? data.rejectionReason ?? null : null,
        reviewedAt: new Date(),
        reviewedById: data.reviewedById,
      },
      include: {
        founder: { include: { profile: true } },
        documents: { where: { deletedAt: null } },
      },
    });
  },

  async getFreelancerDetail(id: string) {
    return prisma.freelancer.findFirst({
      where: { id, deletedAt: null },
      include: {
        user: { include: { profile: true, role: true } },
        skills: { include: { skill: true } },
        experiences: { orderBy: { startDate: "desc" } },
        portfolio: { orderBy: { sortOrder: "asc" } },
        assignments: {
          include: { project: true },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        documents: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  },

  async setFreelancerVerified(id: string, isVerified: boolean) {
    return prisma.freelancer.update({
      where: { id },
      data: { isVerified },
      include: {
        user: { include: { profile: true, role: true } },
        skills: { include: { skill: true } },
      },
    });
  },

  async updateConsultationStatus(
    id: string,
    status: import("@prisma/client").ConsultationStatus,
    notes?: string
  ) {
    return prisma.consultation.update({
      where: { id },
      data: {
        status,
        ...(notes !== undefined ? { notes } : {}),
      },
      include: {
        user: { include: { profile: true } },
        startup: true,
      },
    });
  },

  async listAssignments(params: { skip: number; take: number; status?: string }) {
    const where: Prisma.AssignmentWhereInput = {
      ...(params.status
        ? { status: params.status as import("@prisma/client").AssignmentStatus }
        : {}),
    };
    const [items, total] = await Promise.all([
      prisma.assignment.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
        include: {
          project: true,
          freelancer: {
            include: { user: { include: { profile: true } } },
          },
        },
      }),
      prisma.assignment.count({ where }),
    ]);
    return { items, total };
  },

  async updateAssignmentStatus(
    id: string,
    status: import("@prisma/client").AssignmentStatus
  ) {
    return prisma.assignment.update({
      where: { id },
      data: { status },
      include: {
        project: true,
        freelancer: {
          include: { user: { include: { profile: true } } },
        },
      },
    });
  },

  async frontendAnalytics() {
    const raw = await this.analytics();
    const roles = await prisma.role.findMany();
    const roleMap = Object.fromEntries(roles.map((r) => [r.id, r.name]));

    let founders = 0;
    let freelancers = 0;
    for (const row of raw.usersByRole) {
      const name = roleMap[row.roleId];
      if (name === "FOUNDER") founders = row._count;
      if (name === "FREELANCER") freelancers = row._count;
    }

    const [activeProjects, revenueAgg, projectsByStatus, recentUsers, completedPayments] =
      await Promise.all([
        prisma.project.count({
          where: { deletedAt: null, status: "ACTIVE" },
        }),
        prisma.payment.aggregate({
          where: { status: "COMPLETED" },
          _sum: { amount: true },
        }),
        prisma.project.groupBy({
          by: ["status"],
          where: { deletedAt: null },
          _count: true,
        }),
        prisma.user.findMany({
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          take: 500,
          select: { createdAt: true },
        }),
        prisma.payment.findMany({
          where: { status: "COMPLETED" },
          select: { amount: true, paidAt: true, createdAt: true },
          take: 500,
          orderBy: { createdAt: "desc" },
        }),
      ]);

    const monthMap = new Map<string, number>();
    for (const u of recentUsers) {
      const key = u.createdAt.toLocaleString("en-US", {
        month: "short",
      });
      monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
    }
    const monthlySignups = Array.from(monthMap.entries()).map(
      ([month, count]) => ({ month, count })
    );

    const revenueMap = new Map<string, number>();
    for (const p of completedPayments) {
      const d = p.paidAt ?? p.createdAt;
      const key = d.toLocaleString("en-US", { month: "short" });
      revenueMap.set(key, (revenueMap.get(key) ?? 0) + Number(p.amount));
    }
    const revenueByMonth = Array.from(revenueMap.entries()).map(
      ([month, amount]) => ({ month, amount })
    );

    return {
      users: raw.counts.users,
      founders,
      freelancers,
      startups: raw.counts.startups,
      projects: raw.counts.projects,
      activeProjects,
      revenue: Number(revenueAgg._sum.amount ?? 0),
      consultations: raw.counts.consultations,
      monthlySignups,
      projectsByStatus: projectsByStatus.map((p) => ({
        status: p.status,
        count: p._count,
      })),
      revenueByMonth,
      counts: raw.counts,
      startupsByStatus: raw.startupsByStatus,
    };
  },
};
