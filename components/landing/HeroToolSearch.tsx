"use client";

import React from "react";
import Link from "next/link";
import { ToolSearchBar } from "@/components/tools/ToolSearchBar";
import { TOOLS_COUNT_LABEL } from "@/lib/registry/tools";
import { FileText, Layers, Image as ImageIcon, Code2, Lock } from "lucide-react";

const POPULAR_SEARCHES = [
  { label: "Resume Builder", href: "/editor", icon: FileText },
  { label: "Merge PDF", href: "/tools/document-pdf/pdf-merger", icon: Layers },
  { label: "Compress Image", href: "/tools/image/batch-image-compressor", icon: ImageIcon },
  { label: "JSON Formatter", href: "/tools/developer/json-formatter", icon: Code2 },
  { label: "Password Gen", href: "/tools/utilities/password-generator", icon: Lock },
];

export const HeroToolSearch: React.FC = () => {
  return (
    <div className="relative w-full max-w-xl text-left space-y-2.5 pt-2">
      <div className="relative">
        <ToolSearchBar
          size="large"
          placeholder={`Search ${TOOLS_COUNT_LABEL} & templates... (e.g. PDF merge, resume, compress)`}
        />
      </div>

      {/* Popular Quick Pills */}
      <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-500">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          Popular:
        </span>
        {POPULAR_SEARCHES.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200/90 text-slate-700 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 shadow-2xs text-[11px] font-medium transition-all group"
            >
              <Icon className="h-3 w-3 text-slate-400 group-hover:text-blue-600 transition-colors" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
