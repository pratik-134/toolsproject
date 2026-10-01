import React from "react";
import {
  Layers,
  Highlighter,
  Type,
  FileSignature,
  Stamp,
  Undo2,
  Redo2,
  Download,
} from "lucide-react";
import { usePdfEditorStore } from "../store";
import { EditorMode } from "../types";

interface MobileToolbarProps {
  onExport: () => void;
  isExporting: boolean;
}

export const MobileToolbar: React.FC<MobileToolbarProps> = ({ onExport, isExporting }) => {
  const { mode, setMode, undo, redo, canUndo, canRedo } = usePdfEditorStore();

  const modes: { id: EditorMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: "organize", label: "Pages", icon: Layers },
    { id: "annotate", label: "Annotate", icon: Highlighter },
    { id: "content", label: "Content", icon: Type },
    { id: "sign", label: "Sign", icon: FileSignature },
    { id: "stamp", label: "Stamps", icon: Stamp },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-card/95 backdrop-blur-md border-t border-border px-3 flex items-center justify-between z-40">
      <div className="flex items-center gap-1">
        {modes.map((m) => {
          const Icon = m.icon;
          const isActive = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] min-w-[46px] ${
                isActive ? "text-primary font-bold" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-1.5 border-l border-border pl-2">
        <button
          onClick={undo}
          disabled={!canUndo()}
          className="p-2 rounded-lg text-foreground hover:bg-muted disabled:opacity-30"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={onExport}
          disabled={isExporting}
          className="p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
