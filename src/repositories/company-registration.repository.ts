import type { CompanyRegStatus, Prisma } from "@prisma/client";
import { prisma } from "../prisma";

export const companyRegistrationRepository = {
  create(data: Prisma.CompanyRegistrationCreateInput) {
    return prisma.companyRegistration.create({ data });
  },

  findById(id: string) {
    return prisma.companyRegistration.findFirst({
      where: { id, deletedAt: null },
      include: { documents: { where: { deletedAt: null } }, startup: true },
    });
  },

  update(id: string, data: Prisma.CompanyRegistrationUpdateInput) {
    return prisma.companyRegistration.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.companyRegistration.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  async list(params: {
    skip: number;
    take: number;
    userId?: string;
    status?: CompanyRegStatus;
  }) {
    const where: Prisma.CompanyRegistrationWhereInput = {
      deletedAt: null,
      ...(params.userId ? { userId: params.userId } : {}),
      ...(params.status ? { status: params.status } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.companyRegistration.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.companyRegistration.count({ where }),
    ]);
    return { items, total };
  },
};
