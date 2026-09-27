import { z } from "zod";

export const PostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().max(500).optional().nullable(),
  coverImageUrl: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  seoTitle: z.string().max(70).optional().nullable(),
  seoDescription: z.string().max(160).optional().nullable(),
});

export type PostFormData = z.infer<typeof PostSchema>;
