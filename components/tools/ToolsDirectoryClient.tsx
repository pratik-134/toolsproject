"use client";

import React from "react";
import { ToolDefinition } from "@/lib/registry/types";
import { ToolCardGrid } from "@/components/tools/ToolCardGrid";

interface ToolsDirectoryClientProps {
  tools: ToolDefinition[];
}

export const ToolsDirectoryClient: React.FC<ToolsDirectoryClientProps> = ({ tools }) => {
  return (
    <ToolCardGrid
      tools={tools}
      showCategoryFilter={true}
      showSearchBar={true}
    />
  );
};
