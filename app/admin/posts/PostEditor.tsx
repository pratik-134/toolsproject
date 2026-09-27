"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createPost, updatePost } from "@/lib/actions/blog";
import { type PostFormData } from "@/lib/blog-schema";
import { Loader2, Eye, Edit3, Save } from "lucide-react";

// Dynamic import for react-markdown to avoid SSR issues
import ReactMarkdown from "react-markdown";

interface PostEditorProps {
  initialData?: Partial<PostFormData> & { id?: string };
  mode: "create" | "edit";
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function PostEditor({ initialData, mode }: PostEditorProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.coverImageUrl ?? "");
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription ?? "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!initialData?.slug);
  const [previewMode, setPreviewMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMode, setSaveMode] = useState<"draft" | "publish">("draft");

  // Auto-generate slug from title (unless user has manually edited it)
  useEffect(() => {
    if (!slugManuallyEdited && mode === "create") {
      setSlug(slugify(title));
    }
  }, [title, slugManuallyEdited, mode]);

  // Autosave to sessionStorage every 10s
  const autoSaveKey = `admin_draft_${initialData?.id ?? "new"}`;
  useEffect(() => {
    const timer = setInterval(() => {
      try {
        sessionStorage.setItem(autoSaveKey, JSON.stringify({ title, slug, content, excerpt, coverImageUrl, seoTitle, seoDescription }));
      } catch {
        // Ignore storage errors
      }
    }, 10_000);
    return () => clearInterval(timer);
  }, [title, slug, content, excerpt, coverImageUrl, seoTitle, seoDescription, autoSaveKey]);

  const handleSave = async (publish: boolean) => {
    setError(null);
    setIsSaving(true);
    setSaveMode(publish ? "publish" : "draft");

    const data: PostFormData = {
      title,
      slug,
      content,
      excerpt: excerpt || null,
      coverImageUrl: coverImageUrl || null,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
    };

    const result =
      mode === "create"
        ? await createPost(data, publish)
        : await updatePost(initialData!.id!, data, publish);

    setIsSaving(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    // Clear autosave draft
    try { sessionStorage.removeItem(autoSaveKey); } catch {}

    if (mode === "create" && result.success) {
      router.push(`/admin/posts/${(result as { success: true; id: string }).id}/edit`);
    }
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
          Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My Post Title"
          className="w-full h-11 rounded-lg border border-slate-300 px-3 text-base font-medium
            text-slate-900 placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
          Slug *
        </label>
        <div className="flex items-center">
          <span className="h-10 flex items-center px-3 text-sm text-slate-400 bg-slate-50 border border-r-0 border-slate-300 rounded-l-lg">
            /blog/
          </span>
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugManuallyEdited(true);
            }}
            placeholder="my-post-title"
            className="flex-1 h-10 rounded-r-lg border border-slate-300 px-3 text-sm
              text-slate-900 font-mono placeholder:text-slate-400
              focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Lowercase letters, numbers, and hyphens only. Auto-generated from title.
        </p>
      </div>

      {/* Content with Markdown preview */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Content * (Markdown)
          </label>
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500
              hover:text-slate-900 transition-colors px-2 py-1 rounded-md hover:bg-slate-100"
          >
            {previewMode ? (
              <><Edit3 className="h-3.5 w-3.5" /> Edit</>
            ) : (
              <><Eye className="h-3.5 w-3.5" /> Preview</>
            )}
          </button>
        </div>
        {previewMode ? (
          <div className="min-h-[320px] rounded-lg border border-slate-200 bg-white px-5 py-4
            prose prose-sm prose-slate max-w-none">
            {content ? (
              <ReactMarkdown>{content}</ReactMarkdown>
            ) : (
              <p className="text-slate-400 italic text-sm">Nothing to preview yet.</p>
            )}
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post in Markdown..."
            rows={18}
            className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm font-mono
              text-slate-900 placeholder:text-slate-400 resize-y
              focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
        )}
      </div>

      {/* Excerpt */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
          Excerpt (optional)
        </label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="A short summary shown in blog listings…"
          rows={3}
          maxLength={500}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm
            text-slate-900 placeholder:text-slate-400 resize-none
            focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
        />
        <p className="text-xs text-slate-400 mt-1">{excerpt.length}/500</p>
      </div>

      {/* Cover Image URL */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
          Cover Image URL (optional)
        </label>
        <input
          type="url"
          value={coverImageUrl}
          onChange={(e) => setCoverImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full h-10 rounded-lg border border-slate-300 px-3 text-sm
            text-slate-900 placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
        />
      </div>

      {/* SEO fields */}
      <details className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
        <summary className="text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer select-none">
          SEO Settings (optional)
        </summary>
        <div className="pt-3 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              SEO Title <span className="text-slate-400 font-normal">(ideal: 50–60 chars)</span>
            </label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              maxLength={70}
              className="w-full h-10 rounded-lg border border-slate-300 px-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <p className={`text-xs mt-1 ${seoTitle.length > 60 ? "text-amber-600" : "text-slate-400"}`}>
              {seoTitle.length}/70 chars {seoTitle.length > 60 && "— consider shortening"}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              SEO Description <span className="text-slate-400 font-normal">(ideal: 120–160 chars)</span>
            </label>
            <textarea
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              maxLength={160}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm
                resize-none focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <p className={`text-xs mt-1 ${seoDescription.length > 160 ? "text-red-600" : "text-slate-400"}`}>
              {seoDescription.length}/160 chars
            </p>
          </div>
        </div>
      </details>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => handleSave(false)}
          disabled={isSaving}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-lg
            border border-slate-300 bg-white text-sm font-semibold text-slate-700
            hover:bg-slate-50 hover:border-slate-400
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors"
        >
          {isSaving && saveMode === "draft" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save as Draft
        </button>

        <button
          type="button"
          onClick={() => handleSave(true)}
          disabled={isSaving}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-lg
            bg-emerald-600 text-white text-sm font-semibold
            hover:bg-emerald-700 active:bg-emerald-800
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors"
        >
          {isSaving && saveMode === "publish" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Publish"
          )}
        </button>

        <p className="text-xs text-slate-400 ml-auto">
          Auto-saved locally every 10s
        </p>
      </div>
    </div>
  );
}
