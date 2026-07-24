import { MeetingStatus, MeetingType } from "@prisma/client";
import { z } from "zod";

export const createMeetingSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(5000).optional(),
  type: z.nativeEnum(MeetingType).optional(),
  scheduledAt: z.coerce.date(),
  durationMin: z.number().int().positive().max(480).optional(),
  meetingUrl: z.string().url().optional(),
  location: z.string().max(300).optional(),
  startupId: z.string().cuid().optional(),
  projectId: z.string().cuid().optional(),
  participantIds: z.array(z.string().cuid()).default([]),
  notes: z.string().max(5000).optional(),
});

export const updateMeetingSchema = createMeetingSchema
  .omit({ participantIds: true })
  .partial()
  .extend({
    status: z.nativeEnum(MeetingStatus).optional(),
    participantIds: z.array(z.string().cuid()).optional(),
  });

export const listMeetingsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  status: z.nativeEnum(MeetingStatus).optional(),
});
