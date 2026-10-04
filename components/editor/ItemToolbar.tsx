"use client";

import React from "react";
import { ArrowUp, ArrowDown, Copy, Trash2, ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

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
    <div className="flex items-center gap-0.5 sm:gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
      {/* Mobile Actions Dropdown (sm:hidden) */}
      <div className="sm:hidden flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
              title="More actions"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {onMoveUp && (
              <DropdownMenuItem
                disabled={!canMoveUp || isLocked}
                onClick={onMoveUp}
                className="gap-2 text-xs"
              >
                <ArrowUp className="h-3.5 w-3.5" />
                <span>Move Up</span>
              </DropdownMenuItem>
            )}
            {onMoveDown && (
              <DropdownMenuItem
                disabled={!canMoveDown || isLocked}
                onClick={onMoveDown}
                className="gap-2 text-xs"
              >
                <ArrowDown className="h-3.5 w-3.5" />
                <span>Move Down</span>
              </DropdownMenuItem>
            )}
            {onDuplicate && !isLocked && (
              <DropdownMenuItem onClick={onDuplicate} className="gap-2 text-xs">
                <Copy className="h-3.5 w-3.5" />
                <span>Duplicate</span>
              </DropdownMenuItem>
            )}
            {!isLocked && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onRemove}
                  className="gap-2 text-xs text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop Individual Buttons (hidden sm:inline-flex) */}
      {/* Move Up */}
      {onMoveUp && (
        <Button
          variant="ghost"
          size="icon"
          disabled={!canMoveUp || isLocked}
          onClick={onMoveUp}
          className="hidden sm:inline-flex h-7 w-7 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 rounded-md transition-colors"
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
          className="hidden sm:inline-flex h-7 w-7 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 rounded-md transition-colors"
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
          className="hidden sm:inline-flex h-7 w-7 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
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
          className="hidden sm:inline-flex h-7 w-7 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md transition-colors"
          title="Delete Entry"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}

      {/* Expand / Collapse (Visible on both mobile and desktop) */}
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
