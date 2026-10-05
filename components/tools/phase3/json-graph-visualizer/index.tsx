"use client";

import React, { useState, useMemo } from "react";
import {
  TreeNode,
  JsonValueType,
  parseJsonToTree,
  calculateTreeStats,
  filterTreeNodes,
  generateTreeSvg,
  SAMPLE_JSON,
} from "./logic";
import {
  Network,
  Search,
  Download,
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
  Layers,
  FileJson,
  Sparkles,
  Code,
  RotateCcw,
  Maximize2,
  Minimize2,
} from "lucide-react";

export default function JsonGraphVisualizer() {
  const [jsonInput, setJsonInput] = useState<string>(SAMPLE_JSON);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [selectedPath, setSelectedPath] = useState<string>("$");
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [copiedPath, setCopiedPath] = useState<boolean>(false);

  // Parse JSON
  const { root, error } = useMemo(() => {
    return parseJsonToTree(jsonInput);
  }, [jsonInput]);

  // Filtered Tree based on search query
  const filteredTree = useMemo(() => {
    if (!root) return null;
    return filterTreeNodes(root, searchQuery);
  }, [root, searchQuery]);

  // Tree Metrics
  const stats = useMemo(() => {
    if (!root) return null;
    return calculateTreeStats(root);
  }, [root]);

  // Node collapse toggle
  const toggleCollapse = (id: string) => {
    setCollapsedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    setCollapsedNodes(new Set());
  };

  const handleCollapseAll = () => {
    if (!root) return;
    const allIds = new Set<string>();
    function collect(node: TreeNode) {
      if (node.children.length > 0) {
        allIds.add(node.id);
      }
      node.children.forEach(collect);
    }
    collect(root);
    setCollapsedNodes(allIds);
  };

  // Actions
  const handleFormat = () => {
    try {
      const obj = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(obj, null, 2));
    } catch {
      // Ignore format if invalid
    }
  };

  const handleMinify = () => {
    try {
      const obj = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(obj));
    } catch {
      // Ignore if invalid
    }
  };

  const handleResetSample = () => {
    setJsonInput(SAMPLE_JSON);
    setSearchQuery("");
    setCollapsedNodes(new Set());
    setSelectedPath("$");
  };

  const handleCopyJson = async () => {
    await navigator.clipboard.writeText(jsonInput);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleCopyPath = async (path: string) => {
    await navigator.clipboard.writeText(path);
    setSelectedPath(path);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  const handleDownloadSvg = () => {
    if (!root) return;
    const svg = generateTreeSvg(root, true);
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = "json-graph-diagram.svg";
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([jsonInput], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = "data.json";
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Recursive tree item component
  const renderTreeNode = (node: TreeNode) => {
    const isCollapsed = collapsedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const isSelected = selectedPath === node.path;

    return (
      <div key={node.id} className="relative select-none text-xs">
        <div
          onClick={() => setSelectedPath(node.path)}
          className={`flex items-center gap-2 py-1.5 px-2.5 rounded-lg cursor-pointer transition-colors group ${
            isSelected
              ? "bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400"
              : "hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
          }`}
        >
          {/* Caret or spacer */}
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleCollapse(node.id);
              }}
              className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400"
            >
              {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <span className="w-4.5" />
          )}

          {/* Node Key */}
          <span className="font-mono font-medium">{node.key}</span>
          <span className="text-slate-400">:</span>

          {/* Node Value or Summary */}
          {hasChildren ? (
            <span className="text-[11px] text-slate-400 font-mono">
              {node.value}
            </span>
          ) : (
            <span className={`font-mono text-xs ${getValueColorClass(node.type)}`}>
              {node.type === "string" ? `"${node.value}"` : node.value}
            </span>
          )}

          {/* Type Badge */}
          <span className={`ml-auto text-[9px] px-1.5 py-0.2 rounded font-mono font-medium ${getTypeBadgeClass(node.type)}`}>
            {node.type}
          </span>
        </div>

        {/* Children Render */}
        {hasChildren && !isCollapsed && (
          <div className="pl-5 ml-2.5 border-l border-slate-200/80 dark:border-slate-800 space-y-0.5 my-0.5">
            {node.children.map(renderTreeNode)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Presets & Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Interactive Graph Engine
            </span>
          </div>

          {stats && (
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 font-mono">
              <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                {stats.totalNodes} Nodes
              </span>
              <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                Depth: {stats.maxDepth}
              </span>
              <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                {stats.objectsCount} Objects
              </span>
              <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                {stats.arraysCount} Arrays
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs whitespace-nowrap"
          >
            {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedJson ? "Copied!" : "Copy JSON"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadSvg}
            disabled={!root}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-2xs whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>SVG Graph</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJson}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download JSON</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Raw JSON Editor */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 flex flex-col h-[560px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileJson className="w-3.5 h-3.5" />
                <span>JSON Payload</span>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleFormat}
                  className="px-2 py-1 text-[11px] rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Format JSON"
                >
                  Prettify
                </button>
                <button
                  type="button"
                  onClick={handleMinify}
                  className="px-2 py-1 text-[11px] rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Minify JSON"
                >
                  Minify
                </button>
                <button
                  type="button"
                  onClick={handleResetSample}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="Load Sample Data"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Error banner if invalid JSON */}
            {error && (
              <div className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
                Invalid JSON: {error}
              </div>
            )}

            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste or write raw JSON here..."
              className="flex-1 w-full p-3 font-mono text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right Column: Interactive Visual Tree & Graph */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex-1 flex flex-col h-[560px]">
            {/* Visualizer Controls Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter keys, values, or paths..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Tree Expansion Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleExpandAll}
                  className="px-2 py-1 text-xs rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Expand All
                </button>
                <button
                  type="button"
                  onClick={handleCollapseAll}
                  className="px-2 py-1 text-xs rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Collapse All
                </button>
              </div>
            </div>

            {/* Tree Viewport */}
            <div className="flex-1 overflow-auto rounded-lg bg-slate-50/50 dark:bg-slate-950/70 p-3 border border-slate-200/60 dark:border-slate-800">
              {filteredTree ? (
                renderTreeNode(filteredTree)
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs py-12">
                  <Network className="w-8 h-8 mb-2 opacity-50" />
                  <span>No matching nodes found</span>
                </div>
              )}
            </div>

            {/* Selected Path Breadcrumb Footer */}
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-slate-500 font-mono text-[11px] truncate max-w-[70%]">
                <span className="text-slate-400">JSONPath:</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold">{selectedPath}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopyPath(selectedPath)}
                className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 transition-colors whitespace-nowrap"
              >
                {copiedPath ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPath ? "Copied" : "Copy Path"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getValueColorClass(type: JsonValueType): string {
  switch (type) {
    case "string":
      return "text-emerald-600 dark:text-emerald-400";
    case "number":
      return "text-amber-600 dark:text-amber-400";
    case "boolean":
      return "text-purple-600 dark:text-purple-400";
    case "null":
      return "text-rose-600 dark:text-rose-400";
    default:
      return "text-slate-600 dark:text-slate-300";
  }
}

function getTypeBadgeClass(type: JsonValueType): string {
  switch (type) {
    case "object":
      return "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300";
    case "array":
      return "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300";
    case "string":
      return "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300";
    case "number":
      return "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300";
    case "boolean":
      return "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300";
    case "null":
      return "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300";
  }
}
