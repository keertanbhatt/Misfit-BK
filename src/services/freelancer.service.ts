import type { AvailabilityStatus } from "@prisma/client";
import { freelancerRepository } from "../repositories/freelancer.repository";
import { assignmentRepository } from "../repositories/assignment.repository";
import { paymentRepository } from "../repositories/payment.repository";
import { ForbiddenError, NotFoundError, ValidationError } from "../utils/AppError";
import { getPagination, toPaginated } from "../utils/pagination";

export const freelancerService = {
  async getMine(userId: string) {
    const freelancer = await freelancerRepository.findByUserId(userId);
    if (!freelancer) throw new NotFoundError("Freelancer profile not found");
    return freelancer;
  },

  async getById(id: string) {
    const freelancer = await freelancerRepository.findById(id);
    if (!freelancer) throw new NotFoundError("Freelancer not found");
    return freelancer;
  },

  async list(query: {
    page?: number;
    limit?: number;
    availability?: string;
    search?: string;
    skill?: string;
  }) {
    const { skip, take, page, limit } = getPagination(query);
    const { items, total } = await freelancerRepository.list({
      skip,
      take,
      availability: query.availability as never,
      search: query.search,
      skill: query.skill,
    });
    return toPaginated(items, total, page, limit);
  },

  async updateMine(userId: string, input: Record<string, unknown>) {
    const freelancer = await this.getMine(userId);
    return freelancerRepository.update(freelancer.id, input as never);
  },

  async updateAvailability(userId: string, availability: AvailabilityStatus) {
    const freelancer = await this.getMine(userId);
    return freelancerRepository.update(freelancer.id, { availability });
  },

  async addSkill(
    userId: string,
    input: { skillId?: string; skillName?: string; proficiency: number }
  ) {
    const freelancer = await this.getMine(userId);
    let skillId = input.skillId;
    if (!skillId && input.skillName) {
      const skill = await freelancerRepository.findOrCreateSkill(
        input.skillName
      );
      skillId = skill.id;
    }
    if (!skillId) throw new ValidationError("skillId or skillName required");
    return freelancerRepository.addSkill(
      freelancer.id,
      skillId,
      input.proficiency
    );
  },

  async removeSkill(userId: string, skillRowId: string) {
    await this.getMine(userId);
    await freelancerRepository.removeSkill(skillRowId);
    return { id: skillRowId };
  },

  async addExperience(userId: string, input: Record<string, unknown>) {
    const freelancer = await this.getMine(userId);
    return freelancerRepository.addExperience({
      company: input.company as string,
      title: input.title as string,
      description: input.description as string | undefined,
      startDate: input.startDate as Date,
      endDate: input.endDate as Date | undefined,
      isCurrent: (input.isCurrent as boolean) ?? false,
      freelancer: { connect: { id: freelancer.id } },
    });
  },

  async removeExperience(userId: string, id: string) {
    const freelancer = await this.getMine(userId);
    const exp = await freelancerRepository
      .findByUserId(userId)
      .then((f) => f?.experiences.find((e) => e.id === id));
    if (!exp || !freelancer) throw new NotFoundError("Experience not found");
    await freelancerRepository.removeExperience(id);
    return { id };
  },

  async addPortfolio(userId: string, input: Record<string, unknown>) {
    const freelancer = await this.getMine(userId);
    return freelancerRepository.addPortfolio({
      title: input.title as string,
      description: input.description as string | undefined,
      projectUrl: input.projectUrl as string | undefined,
      imageUrl: input.imageUrl as string | undefined,
      technologies: (input.technologies as string[]) ?? [],
      sortOrder: (input.sortOrder as number) ?? 0,
      freelancer: { connect: { id: freelancer.id } },
    });
  },

  async removePortfolio(userId: string, id: string) {
    const freelancer = await this.getMine(userId);
    const item = freelancer.portfolio.find((p) => p.id === id);
    if (!item) throw new NotFoundError("Portfolio item not found");
    await freelancerRepository.removePortfolio(id);
    return { id };
  },

  async assertIsFreelancer(userId: string) {
    const freelancer = await freelancerRepository.findByUserId(userId);
    if (!freelancer) throw new ForbiddenError("Freelancer profile required");
    return freelancer;
  },

  async myProjects(
    userId: string,
    query: { page?: number; limit?: number; pageSize?: number }
  ) {
    const freelancer = await this.getMine(userId);
    const { skip, take, page, limit } = getPagination(query);
    const { items, total } = await assignmentRepository.list({
      skip,
      take,
      freelancerId: freelancer.id,
    });
    const projects = items.map((a) => ({
      ...a.project,
      assignmentStatus: a.status,
      assignmentId: a.id,
    }));
    return toPaginated(projects, total, page, limit);
  },

  async myPayments(
    userId: string,
    query: { page?: number; limit?: number; pageSize?: number }
  ) {
    await this.getMine(userId);
    const { skip, take, page, limit } = getPagination(query);
    const { items, total } = await paymentRepository.list({
      skip,
      take,
      freelancerUserId: userId,
    });
    return toPaginated(items, total, page, limit);
  },
};
