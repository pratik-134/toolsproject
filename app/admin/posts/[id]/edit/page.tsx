import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostEditor } from "../../PostEditor";
import { getPost } from "@/lib/actions/blog";
import { ArrowLeft } from "lucide-react";
import { PostStatusBadge } from "@/app/admin/PostStatusBadge";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) notFound();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="text-sm text-slate-500 hover:text-slate-900 transition-colors
            inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Posts
        </Link>
        <span className="text-slate-300">/</span>
        <h1 className="text-lg font-semibold text-slate-900 truncate">{post.title}</h1>
        <PostStatusBadge status={post.status} />
      </div>
      <PostEditor
        mode="edit"
        initialData={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          content: post.content,
          excerpt: post.excerpt ?? "",
          coverImageUrl: post.coverImageUrl ?? "",
          seoTitle: post.seoTitle ?? "",
          seoDescription: post.seoDescription ?? "",
        }}
      />
    </div>
  );
}
