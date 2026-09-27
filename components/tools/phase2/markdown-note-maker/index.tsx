"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  MarkdownNote,
  DEFAULT_SAMPLE_NOTES,
  computeNoteStats,
  filterNotes,
  renderMarkdownToHtml,
} from "./logic";
import {
  FileText,
  Download,
  Copy,
  Plus,
  Trash2,
  CheckCircle2,
  Search,
  Tag,
  Clock,
  ShieldCheck,
  Eye,
  Code2,
  BookOpen,
} from "lucide-react";

const STORAGE_KEY = "ct_markdown_notes_v1";

export default function MarkdownNoteMakerTool() {
  const [notes, setNotes] = useState<MarkdownNote[]>(DEFAULT_SAMPLE_NOTES);
  const [activeNoteId, setActiveNoteId] = useState<string>("cleartrix-arch");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);
  const [copiedMd, setCopiedMd] = useState<boolean>(false);
  const [newTagInput, setNewTagInput] = useState<string>("");

  // Load notes from localStorage on client boot
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotes(parsed);
          setActiveNoteId(parsed[0]?.id || "cleartrix-arch");
        }
      }
    } catch {
      // Fallback
    }
  }, []);

  // Save notes to localStorage
  const saveNotes = useCallback((updated: MarkdownNote[]) => {
    setNotes(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Fallback
    }
  }, []);

  const activeNote = useMemo(() => {
    return notes.find((n) => n.id === activeNoteId) || notes[0] || DEFAULT_SAMPLE_NOTES[0];
  }, [notes, activeNoteId]);

  const updateActiveNote = (fields: Partial<MarkdownNote>) => {
    if (!activeNote) return;
    const updated = notes.map((n) =>
      n.id === activeNote.id ? { ...n, ...fields, updatedAt: Date.now() } : n
    );
    saveNotes(updated);
  };

  const createNewNote = () => {
    const newNote: MarkdownNote = {
      id: Math.random().toString(36).substring(2, 9),
      title: "Untitled Note",
      content: "# Untitled Note\n\nStart writing in markdown...",
      tags: ["draft"],
      updatedAt: Date.now(),
    };
    const updated = [newNote, ...notes];
    saveNotes(updated);
    setActiveNoteId(newNote.id);
  };

  const deleteNote = (id: string) => {
    if (notes.length <= 1) {
      alert("You must keep at least one note.");
      return;
    }
    const updated = notes.filter((n) => n.id !== id);
    saveNotes(updated);
    if (activeNoteId === id) {
      setActiveNoteId(updated[0]?.id || "");
    }
  };

  const addTag = () => {
    const tag = newTagInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (!tag || !activeNote) return;
    if (!activeNote.tags.includes(tag)) {
      updateActiveNote({ tags: [...activeNote.tags, tag] });
    }
    setNewTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    if (!activeNote) return;
    updateActiveNote({ tags: activeNote.tags.filter((t) => t !== tagToRemove) });
  };

  const filteredNotes = useMemo(() => {
    return filterNotes(notes, searchQuery, selectedTag);
  }, [notes, searchQuery, selectedTag]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => n.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [notes]);

  const stats = useMemo(() => {
    return computeNoteStats(activeNote?.content || "");
  }, [activeNote?.content]);

  const renderedHtml = useMemo(() => {
    return renderMarkdownToHtml(activeNote?.content || "");
  }, [activeNote?.content]);

  const handleCopyMarkdown = async () => {
    if (!activeNote) return;
    try {
      await navigator.clipboard.writeText(activeNote.content);
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 2000);
    } catch {
      // Fallback
    }
  };

  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Privacy guarantee badge */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-medium">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        <span>
          100% In-Browser Local Storage — Notes live strictly in your browser memory and private device storage.
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Notes Explorer & Search */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 bg-card border border-border rounded-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Notes ({notes.length})
              </h3>
              <Button
                variant="default"
                size="sm"
                onClick={createNewNote}
                className="h-7 text-xs gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="w-3.5 h-3.5" />
                New Note
              </Button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes or tags..."
                className="w-full pl-8 pr-3 py-1.5 bg-muted/40 border border-border rounded-lg text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            {/* Tags Bar */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                <button
                  onClick={() => setSelectedTag(undefined)}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                    !selectedTag
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All
                </button>
                {allTags.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTag(selectedTag === t ? undefined : t)}
                    className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                      selectedTag === t
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    #{t}
                  </button>
                ))}
              </div>
            )}

            {/* Notes List */}
            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredNotes.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No matching notes found.</p>
              ) : (
                filteredNotes.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => setActiveNoteId(n.id)}
                    className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors flex items-center justify-between gap-2 ${
                      activeNote?.id === n.id
                        ? "bg-primary/10 border-primary/40 text-foreground"
                        : "bg-card border-border hover:bg-muted/30 text-muted-foreground"
                    }`}
                  >
                    <div className="truncate">
                      <p className="font-semibold text-foreground truncate">{n.title || "Untitled"}</p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {new Date(n.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {notes.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNote(n.id);
                        }}
                        className="text-muted-foreground hover:text-destructive p-1"
                        title="Delete note"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Split-Pane Editor & Live Preview */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-4 bg-card border border-border rounded-xl space-y-3">
            {/* Note Title & Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border">
              <input
                type="text"
                value={activeNote?.title || ""}
                onChange={(e) => updateActiveNote({ title: e.target.value })}
                placeholder="Note Title"
                className="text-sm font-bold text-foreground bg-transparent border-0 focus:outline-none focus:ring-0 w-full sm:w-auto"
              />

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyMarkdown}
                  className="h-7 text-xs gap-1"
                >
                  {copiedMd ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedMd ? "Copied" : "Copy"}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadFile(
                      `${activeNote?.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "note"}.md`,
                      activeNote?.content || "",
                      "text/markdown;charset=utf-8"
                    )
                  }
                  className="h-7 text-xs gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  .md
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  onClick={() =>
                    downloadFile(
                      `${activeNote?.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "note"}.html`,
                      renderedHtml,
                      "text/html;charset=utf-8"
                    )
                  }
                  className="h-7 text-xs gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Download className="w-3.5 h-3.5" />
                  .html
                </Button>
              </div>
            </div>

            {/* Tags Editor & Stats */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs py-1">
              <div className="flex flex-wrap items-center gap-1">
                {activeNote?.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-[10px] font-medium text-foreground"
                  >
                    #{t}
                    <button
                      onClick={() => removeTag(t)}
                      className="text-muted-foreground hover:text-destructive text-xs leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}

                <div className="inline-flex items-center gap-1">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTag()}
                    placeholder="+tag"
                    className="w-16 px-1.5 py-0.5 bg-muted/30 border border-border rounded text-[10px] text-foreground focus:outline-none"
                  />
                  <Button variant="ghost" size="sm" onClick={addTag} className="h-5 px-1.5 text-[10px]">
                    Add
                  </Button>
                </div>
              </div>

              {/* Stats readout */}
              <div className="flex items-center gap-3 text-muted-foreground text-[11px] font-mono">
                <span>{stats.words} words</span>
                <span>{stats.chars} chars</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {stats.readingTimeMin} min read
                </span>
              </div>
            </div>

            {/* Split Editor Panes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {/* Markdown Source Pane */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                  <Code2 className="w-3 h-3" />
                  Markdown Source
                </span>
                <textarea
                  value={activeNote?.content || ""}
                  onChange={(e) => updateActiveNote({ content: e.target.value })}
                  rows={16}
                  className="w-full p-3 font-mono text-xs bg-muted/20 border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-none resize-y leading-relaxed"
                />
              </div>

              {/* Rendered HTML Sheet Pane */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  Live Preview
                </span>
                <div
                  className="p-4 bg-white dark:bg-slate-900 border border-border rounded-lg min-h-[300px] max-h-[380px] overflow-y-auto font-sans text-xs shadow-xs"
                  dangerouslySetInnerHTML={{ __html: renderedHtml }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
