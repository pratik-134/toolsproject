"use client";

import React, { useState, useMemo } from "react";
import {
  Code,
  Check,
  Copy,
  Sparkles,
  ListFilter,
  Layers,
  ArrowRight,
  Info,
} from "lucide-react";
import {
  parseRegexExplanation,
  executeRegexMatch,
  RegexNode,
} from "./logic";

export default function RegexVisualizerTool() {
  const [pattern, setPattern] = useState<string>("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");
  const [flags, setFlags] = useState<string>("gi");
  const [testString, setTestString] = useState<string>(
    "Contact us at hello@qwertygen.com or support@example.org for assistance."
  );
  const [copiedRegex, setCopiedRegex] = useState<boolean>(false);

  const nodes: RegexNode[] = useMemo(() => {
    return parseRegexExplanation(pattern);
  }, [pattern]);

  const matchResult = useMemo(() => {
    return executeRegexMatch(pattern, flags, testString);
  }, [pattern, flags, testString]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`/${pattern}/${flags}`);
    setCopiedRegex(true);
    setTimeout(() => setCopiedRegex(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm text-foreground">
              Interactive RegEx Visualizer & Rail Diagram
            </span>
            <span className="text-[11px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              Railroad AST Inspector
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 shadow-sm transition-opacity"
            >
              {copiedRegex ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedRegex ? "Copied" : "Copy Pattern"}
            </button>
          </div>
        </div>

        {/* Pattern & Flags Inputs */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <div className="flex-1 flex items-center rounded-xl border border-border bg-background px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary">
            <span className="font-mono text-muted-foreground mr-1">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="w-full bg-transparent font-mono text-xs text-foreground outline-none"
              placeholder="e.g. ^[a-z0-9]+$"
            />
            <span className="font-mono text-muted-foreground ml-1">/</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground font-medium">Flags:</span>
            <input
              type="text"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              className="w-16 px-2.5 py-1.5 rounded-xl border border-border bg-background font-mono text-xs text-foreground outline-none"
              placeholder="g, i, m"
            />
          </div>
        </div>

        {!matchResult.isValid && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-medium">
            {matchResult.error}
          </div>
        )}
      </div>

      {/* Railroad Visual Flow Diagram */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 pb-2 border-b border-border/50">
          <Layers className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">
            Interactive Expression Rail Diagram
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2 overflow-x-auto p-4 rounded-xl bg-muted/40 border border-border/70 min-h-[90px]">
          {nodes.map((n, idx) => (
            <React.Fragment key={n.id}>
              <div className="group relative rounded-xl border border-border bg-card px-3 py-2 flex flex-col items-center shadow-sm hover:ring-2 hover:ring-primary cursor-pointer transition-all">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">{n.label}</span>
                <span className="font-mono text-xs font-bold text-foreground mt-0.5">{n.raw}</span>

                {/* Tooltip Description */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block z-30 p-2 rounded-lg bg-popover text-popover-foreground border border-border text-[11px] w-48 shadow-xl">
                  {n.description}
                </div>
              </div>

              {idx < nodes.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-50 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Test String Matching Sandbox */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Test String Input</span>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            rows={5}
            className="w-full p-3 rounded-xl border border-border bg-background font-mono text-xs focus:ring-2 focus:ring-primary outline-none"
            placeholder="Type or paste text to test regex matches..."
          />
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Live Matches</span>
            <span className="text-xs text-emerald-500 font-semibold">
              {matchResult.matches.length} matches found
            </span>
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/30 p-3 max-h-[125px] overflow-y-auto space-y-1.5 font-mono text-xs">
            {matchResult.matches.length === 0 ? (
              <span className="text-muted-foreground text-xs italic">No matching tokens found in test string.</span>
            ) : (
              matchResult.matches.map((m, idx) => (
                <div key={idx} className="flex items-center gap-2 p-1 rounded bg-background border border-border">
                  <span className="text-[10px] text-muted-foreground px-1 bg-muted rounded">#{idx + 1}</span>
                  <span className="text-emerald-500 font-bold">{m.match}</span>
                  <span className="text-[10px] text-muted-foreground">Index: {m.index}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
