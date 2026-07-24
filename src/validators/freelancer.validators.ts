import { AvailabilityStatus } from "@prisma/client";
import { z } from "zod";

export const updateFreelancerSchema = z.object({
  headline: z.string().max(300).optional().nullable(),
  bio: z.string().max(10000).optional().nullable(),
  hourlyRate: z.number().nonnegative().optional().nullable(),
  currency: z.string().length(3).optional(),
  yearsExperience: z.number().int().nonnegative().optional().nullable(),
  resumeUrl: z.string().url().optional().nullable(),
  portfolioUrl: z.string().url().optional().nullable(),
  availability: z.nativeEnum(AvailabilityStatus).optional(),
});

export const addSkillSchema = z.object({
  skillId: z.string().cuid().optional(),
  skillName: z.string().min(1).max(100).optional(),
  proficiency: z.number().int().min(1).max(5).default(3),
}).refine((d) => d.skillId || d.skillName, {
  message: "skillId or skillName required",
});

export const addExperienceSchema = z.object({
  company: z.string().min(1).max(200),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  isCurrent: z.boolean().optional(),
});

export const addPortfolioSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  projectUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  technologies: z.array(z.string()).default([]),
  sortOrder: z.number().int().optional(),
});

export const listFreelancersSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  availability: z.nativeEnum(AvailabilityStatus).optional(),
  search: z.string().optional(),
  skill: z.string().optional(),
});
