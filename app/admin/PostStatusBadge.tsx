import { PostStatus } from "@prisma/client";

export function PostStatusBadge({ status }: { status: PostStatus }) {
  if (status === "PUBLISHED") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md
        text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Published
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md
      text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      Draft
    </span>
  );
}
