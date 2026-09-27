/**
 * ToolContext
 *
 * Provides the current tool's category ID to any descendant shell component
 * (UploadBox, ProgressBar, ResultPanel) without prop-drilling through 110+ tool files.
 *
 * Usage:
 *   - Provider: <ToolContextProvider categoryId="document-pdf">…</ToolContextProvider>
 *   - Consumer: const { categoryId } = useToolContext();
 */

"use client";

import React, { createContext, useContext } from "react";
import { CategoryId } from "@/lib/registry/types";

interface ToolContextValue {
  categoryId: CategoryId | null;
}

const ToolContext = createContext<ToolContextValue>({ categoryId: null });

export function ToolContextProvider({
  categoryId,
  children,
}: {
  categoryId: CategoryId;
  children: React.ReactNode;
}) {
  return (
    <ToolContext.Provider value={{ categoryId }}>
      {children}
    </ToolContext.Provider>
  );
}

export function useToolContext(): ToolContextValue {
  return useContext(ToolContext);
}
