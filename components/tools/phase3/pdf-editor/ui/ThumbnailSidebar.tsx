import React, { useState } from "react";
import {
  RotateCw,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  FileUp,
  Tag,
  GripVertical,
} from "lucide-react";
import { usePdfEditorStore } from "../store";

interface ThumbnailSidebarProps {
  onInsertBlank: () => void;
  onInsertFromFile: () => void;
  onExtractPages: () => void;
}

export const ThumbnailSidebar: React.FC<ThumbnailSidebarProps> = ({
  onInsertBlank,
  onInsertFromFile,
  onExtractPages,
}) => {
  const {
    pages,
    activePageIndex,
    setActivePageIndex,
    reorderPages,
    rotatePage,
    duplicatePage,
    deletePage,
    setPageLabel,
  } = usePdfEditorStore();

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [editingLabelIdx, setEditingLabelIdx] = useState<number | null>(null);
  const [tempLabel, setTempLabel] = useState("");

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIdx !== null && draggedIdx !== targetIndex) {
      reorderPages(draggedIdx, targetIndex);
    }
    setDraggedIdx(null);
  };

  const startEditingLabel = (index: number, currentLabel?: string) => {
    setEditingLabelIdx(index);
    setTempLabel(currentLabel || `Page ${index + 1}`);
  };

  const saveLabel = (index: number) => {
    if (tempLabel.trim()) {
      setPageLabel(index, tempLabel.trim());
    }
    setEditingLabelIdx(null);
  };

  return (
    <aside className="w-56 border-r border-border bg-card/40 flex flex-col h-full select-none z-10 shrink-0">
      {/* Sidebar Header */}
      <div className="h-10 px-3 border-b border-border flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
          Pages ({pages.length})
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onInsertBlank}
            title="Add Blank Page"
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onInsertFromFile}
            title="Insert PDF File"
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <FileUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Pages List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {pages.map((page, index) => {
          const isActive = index === activePageIndex;

          return (
            <div
              key={page.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onClick={() => setActivePageIndex(index)}
              className={`group relative rounded-lg border transition-all cursor-pointer bg-background p-2 ${
                isActive
                  ? "border-primary ring-2 ring-primary/20 shadow-xs"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {/* Thumbnail Area */}
              <div className="relative aspect-[3/4] bg-muted/30 rounded border border-border/40 overflow-hidden flex items-center justify-center">
                {page.thumbnailUrl ? (
                  <img
                    src={page.thumbnailUrl}
                    alt={`Page ${index + 1}`}
                    className="w-full h-full object-contain"
                    style={{
                      transform: `rotate(${page.rotation}deg)`,
                      transition: "transform 0.2s ease",
                    }}
                  />
                ) : (
                  <div className="text-xs text-muted-foreground font-mono">
                    Page {index + 1}
                  </div>
                )}

                {/* Quick Action Overlay on Hover */}
                <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      rotatePage(index, "cw");
                    }}
                    title="Rotate 90° CW"
                    className="p-1.5 rounded-md bg-card border border-border hover:bg-muted text-foreground transition-colors shadow-xs"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicatePage(index);
                    }}
                    title="Duplicate Page"
                    className="p-1.5 rounded-md bg-card border border-border hover:bg-muted text-foreground transition-colors shadow-xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {pages.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePage(index);
                      }}
                      title="Delete Page"
                      className="p-1.5 rounded-md bg-card border border-border text-red-600 hover:bg-red-500/10 transition-colors shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Page Number & Label Row */}
              <div className="mt-2 flex items-center justify-between text-xs">
                {editingLabelIdx === index ? (
                  <input
                    type="text"
                    value={tempLabel}
                    onChange={(e) => setTempLabel(e.target.value)}
                    onBlur={() => saveLabel(index)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveLabel(index);
                      if (e.key === "Escape") setEditingLabelIdx(null);
                    }}
                    autoFocus
                    className="w-full text-xs px-1.5 py-0.5 rounded border border-primary bg-background focus:outline-hidden"
                  />
                ) : (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditingLabel(index, page.label);
                    }}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground font-medium truncate"
                    title="Click to rename page label"
                  >
                    <span className="truncate">{page.label || `Page ${index + 1}`}</span>
                    <Tag className="w-2.5 h-2.5 opacity-50 group-hover:opacity-100 shrink-0" />
                  </div>
                )}

                {/* Reorder Buttons */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    disabled={index === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      reorderPages(index, index - 1);
                    }}
                    title="Move Page Up"
                    className="p-0.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    disabled={index === pages.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      reorderPages(index, index + 1);
                    }}
                    title="Move Page Down"
                    className="p-0.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-border bg-card/60 space-y-1.5">
        <button
          onClick={onInsertBlank}
          className="w-full py-1.5 px-2 rounded-md border border-border/80 hover:bg-muted text-xs font-medium text-foreground flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Blank Page</span>
        </button>
        <button
          onClick={onExtractPages}
          className="w-full py-1.5 px-2 rounded-md border border-border/80 hover:bg-muted text-xs font-medium text-foreground flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>Extract Selected</span>
        </button>
      </div>
    </aside>
  );
};
