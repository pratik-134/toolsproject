/**
 * app/admin/page.tsx
 * Protected admin dashboard — lists all blog posts.
 */

import React from "react";
import Link from "next/link";
import { listPosts } from "@/lib/actions/blog";
import { PostStatusBadge } from "./PostStatusBadge";
import { DeletePostButton } from "./DeletePostButton";
import { Plus, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let posts: Awaited<ReturnType<typeof listPosts>> = [];
  let dbError: string | null = null;

  try {
    posts = await listPosts();
  } catch (err: any) {
    dbError = err?.message || "Failed to reach database";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Blog Posts</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {posts.length} post{posts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg
            bg-slate-900 text-white text-sm font-semibold
            hover:bg-slate-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Post
        </Link>
      </div>

      {/* DB Connection Warning */}
      {dbError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center space-y-2">
          <h3 className="text-sm font-semibold text-amber-900">Database Connection Required</h3>
          <p className="text-xs text-amber-800 max-w-lg mx-auto">
            Cannot reach PostgreSQL database. Please make sure PostgreSQL is running and your <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">DATABASE_URL</code> in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env</code> is active.
          </p>
        </div>
      )}

      {/* Post list */}
      {!dbError && posts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm font-medium text-slate-600">No posts yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Create your first post to get started.
          </p>
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-slate-900 hover:underline"
          >
            <Plus className="h-3.5 w-3.5" /> New Post
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Title
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">
                  Updated
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 truncate max-w-[280px]">
                      {post.title}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[280px]">
                      /blog/{post.slug}
                    </div>
                    <div className="sm:hidden mt-1">
                      <PostStatusBadge status={post.status} />
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <PostStatusBadge status={post.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 hidden md:table-cell whitespace-nowrap">
                    {post.updatedAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                      >
                        Edit
                      </Link>
                      {post.status === "PUBLISHED" && (
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          View ↗
                        </Link>
                      )}
                      <DeletePostButton id={post.id} title={post.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
