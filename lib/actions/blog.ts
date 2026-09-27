"use server";

/**
 * lib/actions/blog.ts
 * Server Actions for blog post CRUD.
 * EVERY action verifies the admin session server-side — never trust
 * client-side route protection alone.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { PostStatus } from "@prisma/client";
import { PostSchema, type PostFormData } from "@/lib/blog-schema";

// ─── Auth guard ──────────────────────────────────────────────────────────────

async function requireAdmin(): Promise<void> {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function listPosts() {
  await requireAdmin();
  return prisma.blogPost.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      publishedAt: true,
      updatedAt: true,
    },
  });
}

export async function getPost(id: string) {
  await requireAdmin();
  return prisma.blogPost.findUnique({ where: { id } });
}

export async function createPost(
  data: PostFormData,
  publish: boolean
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  await requireAdmin();

  const parsed = PostSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation error" };
  }

  // Check slug uniqueness
  const existing = await prisma.blogPost.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return { success: false, error: "A post with this slug already exists" };
  }

  const now = new Date();
  const post = await prisma.blogPost.create({
    data: {
      ...parsed.data,
      coverImageUrl: parsed.data.coverImageUrl || null,
      excerpt: parsed.data.excerpt || null,
      seoTitle: parsed.data.seoTitle || null,
      seoDescription: parsed.data.seoDescription || null,
      status: publish ? PostStatus.PUBLISHED : PostStatus.DRAFT,
      publishedAt: publish ? now : null,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/blog");
  return { success: true, id: post.id };
}

export async function updatePost(
  id: string,
  data: PostFormData,
  publish: boolean
): Promise<{ success: true } | { success: false; error: string }> {
  await requireAdmin();

  const parsed = PostSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Validation error" };
  }

  // Check slug uniqueness (excluding self)
  const slugConflict = await prisma.blogPost.findFirst({
    where: { slug: parsed.data.slug, NOT: { id } },
  });
  if (slugConflict) {
    return { success: false, error: "A post with this slug already exists" };
  }

  // Only set publishedAt once (on first publish)
  const current = await prisma.blogPost.findUnique({ where: { id }, select: { publishedAt: true } });
  const publishedAt =
    publish
      ? current?.publishedAt ?? new Date()
      : null;

  await prisma.blogPost.update({
    where: { id },
    data: {
      ...parsed.data,
      coverImageUrl: parsed.data.coverImageUrl || null,
      excerpt: parsed.data.excerpt || null,
      seoTitle: parsed.data.seoTitle || null,
      seoDescription: parsed.data.seoDescription || null,
      status: publish ? PostStatus.PUBLISHED : PostStatus.DRAFT,
      publishedAt,
    },
  });

  revalidatePath("/admin");
  revalidatePath(`/blog/${parsed.data.slug}`);
  revalidatePath("/blog");
  return { success: true };
}

export async function deletePost(id: string): Promise<void> {
  await requireAdmin();
  const post = await prisma.blogPost.findUnique({ where: { id }, select: { slug: true } });
  await prisma.blogPost.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/blog");
  if (post?.slug) revalidatePath(`/blog/${post.slug}`);
}
