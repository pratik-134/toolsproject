import React from "react";
import {
  Layers,
  Highlighter,
  Type,
  FileSignature,
  Stamp,
  FormInput,
  ShieldAlert,
  Lock,
} from "lucide-react";
import { usePdfEditorStore } from "../store";
import { EditorMode } from "../types";

export const ModeTabs: React.FC = () => {
  const { mode, setMode } = usePdfEditorStore();

  const tabs: { id: EditorMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: "organize", label: "Organize Pages", icon: Layers },
    { id: "annotate", label: "Annotate", icon: Highlighter },
    { id: "content", label: "Edit Content", icon: Type },
    { id: "forms", label: "Interactive Forms", icon: FormInput },
    { id: "redact", label: "Redact", icon: ShieldAlert },
    { id: "sign", label: "Fill & Sign", icon: FileSignature },
    { id: "stamp", label: "Stamps & Numbers", icon: Stamp },
    { id: "security", label: "Security & Metadata", icon: Lock },
  ];

  return (
    <nav className="h-11 border-b border-border bg-muted/30 px-3 flex items-center gap-1 overflow-x-auto no-scrollbar select-none z-20">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = mode === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setMode(tab.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
              isActive
                ? "bg-background text-foreground shadow-xs border border-border/80 font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
