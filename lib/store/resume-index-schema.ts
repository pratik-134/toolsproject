import { z } from "zod";

export const resumeIndexItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().default("Untitled Resume"),
  templateId: z.string().default("modern"),
  createdAt: z.string(),
  updatedAt: z.string(),
  thumbnail: z.string().optional(),
  completenessScore: z.number().min(0).max(100).optional().default(0),
});

export type ResumeIndexItem = z.infer<typeof resumeIndexItemSchema>;

export const resumeIndexSchema = z.array(resumeIndexItemSchema);
export type ResumeIndex = z.infer<typeof resumeIndexSchema>;
