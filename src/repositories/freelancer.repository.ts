import type { AvailabilityStatus, Prisma } from "@prisma/client";
import { prisma } from "../prisma";

const freelancerInclude = {
  user: { include: { profile: true } },
  skills: { include: { skill: true } },
  experiences: { orderBy: { startDate: "desc" as const } },
  portfolio: { orderBy: { sortOrder: "asc" as const } },
};

export const freelancerRepository = {
  findByUserId(userId: string) {
    return prisma.freelancer.findFirst({
      where: { userId, deletedAt: null },
      include: freelancerInclude,
    });
  },

  findById(id: string) {
    return prisma.freelancer.findFirst({
      where: { id, deletedAt: null },
      include: freelancerInclude,
    });
  },

  update(id: string, data: Prisma.FreelancerUpdateInput) {
    return prisma.freelancer.update({
      where: { id },
      data,
      include: freelancerInclude,
    });
  },

  async list(params: {
    skip: number;
    take: number;
    availability?: AvailabilityStatus;
    search?: string;
    skill?: string;
  }) {
    const where: Prisma.FreelancerWhereInput = {
      deletedAt: null,
      ...(params.availability ? { availability: params.availability } : {}),
      ...(params.search
        ? {
            OR: [
              { headline: { contains: params.search, mode: "insensitive" } },
              { bio: { contains: params.search, mode: "insensitive" } },
              {
                user: {
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
              },
            ],
          }
        : {}),
      ...(params.skill
        ? {
            skills: {
              some: {
                skill: { name: { contains: params.skill, mode: "insensitive" } },
              },
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.freelancer.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
        include: freelancerInclude,
      }),
      prisma.freelancer.count({ where }),
    ]);
    return { items, total };
  },

  findOrCreateSkill(name: string) {
    return prisma.skill.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  },

  addSkill(freelancerId: string, skillId: string, proficiency: number) {
    return prisma.freelancerSkill.upsert({
      where: {
        freelancerId_skillId: { freelancerId, skillId },
      },
      update: { proficiency },
      create: { freelancerId, skillId, proficiency },
      include: { skill: true },
    });
  },

  removeSkill(id: string) {
    return prisma.freelancerSkill.delete({ where: { id } });
  },

  addExperience(data: Prisma.FreelancerExperienceCreateInput) {
    return prisma.freelancerExperience.create({ data });
  },

  updateExperience(id: string, data: Prisma.FreelancerExperienceUpdateInput) {
    return prisma.freelancerExperience.update({ where: { id }, data });
  },

  removeExperience(id: string) {
    return prisma.freelancerExperience.delete({ where: { id } });
  },

  addPortfolio(data: Prisma.PortfolioItemCreateInput) {
    return prisma.portfolioItem.create({ data });
  },

  updatePortfolio(id: string, data: Prisma.PortfolioItemUpdateInput) {
    return prisma.portfolioItem.update({ where: { id }, data });
  },

  removePortfolio(id: string) {
    return prisma.portfolioItem.delete({ where: { id } });
  },
};
