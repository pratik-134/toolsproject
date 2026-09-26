"use client";

import React from "react";
import { ToolSearchBar } from "@/components/tools/ToolSearchBar";

export const HeroToolSearch: React.FC = () => {
  return (
    <div className="relative w-full max-w-lg mt-4 text-left">
      <ToolSearchBar
        size="default"
        placeholder="Search 111+ tools... (e.g. PDF merge, BMI calculator, hash generator)"
      />
    </div>
  );
};
