import React from "react";
import Link from "next/link";
import { PostEditor } from "../PostEditor";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "New Post — Admin" };

export default function NewPostPage() {
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
        <h1 className="text-lg font-semibold text-slate-900">New Post</h1>
      </div>
      <PostEditor mode="create" />
    </div>
  );
}
