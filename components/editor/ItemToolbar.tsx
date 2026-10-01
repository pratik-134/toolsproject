"use client";

import React from "react";
import { ArrowUp, ArrowDown, Copy, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ItemToolbarProps {
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onDuplicate?: () => void;
  onRemove: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isLocked?: boolean;
}

export const ItemToolbar: React.FC<ItemToolbarProps> = ({
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
  onDuplicate,
  onRemove,
  isExpanded,
  onToggleExpand,
  isLocked = false,
}) => {
  return (
    <div className="flex items-center gap-0.5 sm:gap-1" onClick={(e) => e.stopPropagation()}>
      {/* Move Up */}
      {onMoveUp && (
        <Button
          variant="ghost"
          size="icon"
          disabled={!canMoveUp || isLocked}
          onClick={onMoveUp}
          className="h-7 w-7 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 rounded-md transition-colors"
          title="Move Item Up"
        >
          <ArrowUp className="h-3 w-3" />
        </Button>
      )}

      {/* Move Down */}
      {onMoveDown && (
        <Button
          variant="ghost"
          size="icon"
          disabled={!canMoveDown || isLocked}
          onClick={onMoveDown}
          className="h-7 w-7 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 rounded-md transition-colors"
          title="Move Item Down"
        >
          <ArrowDown className="h-3 w-3" />
        </Button>
      )}

      {/* Duplicate Item */}
      {onDuplicate && !isLocked && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onDuplicate}
          className="h-7 w-7 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
          title="Duplicate Entry"
        >
          <Copy className="h-3 w-3" />
        </Button>
      )}

      {/* Delete Item */}
      {!isLocked && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-7 w-7 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md transition-colors"
          title="Delete Entry"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}

      {/* Expand / Collapse */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleExpand}
        className="h-7 w-7 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
      >
        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
};
