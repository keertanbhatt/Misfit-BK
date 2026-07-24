import { z } from "zod";

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  displayName: z.string().max(200).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  bio: z.string().max(5000).optional().nullable(),
  companyName: z.string().max(200).optional().nullable(),
  website: z.string().url().optional().nullable(),
  linkedinUrl: z.string().url().optional().nullable(),
  twitterUrl: z.string().url().optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  timezone: z.string().max(100).optional().nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
