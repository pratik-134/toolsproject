import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { getAllTools, getToolBySlug } from "@/lib/registry/tools";
import { ToolLayout } from "@/components/tool-shell/ToolLayout";
import { ToolView } from "@/components/tools/ToolView";
import { constructToolMetadata } from "@/lib/seo/metadata";
import { generateToolJsonLd } from "@/lib/seo/jsonld";

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
  const { category, slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};

  return constructToolMetadata({
    title: tool.seo.title,
    description: tool.seo.description,
    slug: tool.slug,
    categorySlug: tool.category,
    keywords: [
      tool.name,
      tool.category,
      `${tool.name} free online`,
      `${tool.name} private in-browser`,
      "no upload",
      "zero tracking",
    ],
  });
}

export default async function DynamicToolPage({ params }: ToolPageProps) {
  const { category, slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool || tool.category !== category) {
    notFound();
  }

  const toolSchema = generateToolJsonLd(tool);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }}
      />
      <ToolLayout tool={tool}>
        <ToolView slug={slug} />
      </ToolLayout>
    </>
  );
}
