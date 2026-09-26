import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { getAllTools, getToolBySlug } from "@/lib/registry/tools";
import { ToolLayout } from "@/components/tool-shell/ToolLayout";
import { ToolView } from "@/components/tools/ToolView";

interface ToolPageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const tools = getAllTools();
  return tools
    .filter((t) => t.slug !== "resume-builder" && t.status === "live")
    .map((t) => ({
      category: t.category,
      slug: t.slug,
    }));
}

export async function generateMetadata({
  params,
}: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};

  return {
    title: `${tool.seo.title} | ${BRAND.name}`,
    description: tool.seo.description,
    openGraph: {
      title: `${tool.seo.title} | ${BRAND.name}`,
      description: tool.seo.description,
      type: "website",
    },
  };
}

export default async function DynamicToolPage({ params }: ToolPageProps) {
  const { category, slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool || tool.category !== category) {
    notFound();
  }

  return (
    <ToolLayout tool={tool}>
      <ToolView slug={slug} />
    </ToolLayout>
  );
}
