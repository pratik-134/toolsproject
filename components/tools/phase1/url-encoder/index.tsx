"use client";

import React, { useState } from "react";
import { Copy, Check, ArrowRightLeft, Plus, Trash2, ExternalLink } from "lucide-react";
import { encodeUrl, decodeUrl, parseUrlQuery, buildUrlWithParams, QueryParamItem } from "./logic";

export default function UrlEncoderTool() {
  const [activeTab, setActiveTab] = useState<"quick" | "params">("quick");

  // Quick Encode/Decode state
  const [inputText, setInputText] = useState("");
  const [encodeMode, setEncodeMode] = useState<"component" | "full">("component");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Parameter Editor state
  const [paramBaseUrl, setParamBaseUrl] = useState("https://api.example.com/v1/search");
  const [queryParams, setQueryParams] = useState<QueryParamItem[]>([
    { id: "1", key: "query", value: "frontend developer resume", enabled: true },
    { id: "2", key: "limit", value: "25", enabled: true },
    { id: "3", key: "sort", value: "date_desc", enabled: true },
    { id: "4", key: "filter", value: "remote only", enabled: false },
  ]);

  const copyToClipboard = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // fallback
    }
  };

  // Calculations for Quick tab
  const encodedResult = encodeUrl(inputText, encodeMode);
  const decodedResult = decodeUrl(inputText);

  // Reconstructed URL for Params tab
  const generatedUrl = buildUrlWithParams(paramBaseUrl, queryParams);

  const handleImportUrl = (url: string) => {
    const parsed = parseUrlQuery(url);
    if (parsed.baseUrl) setParamBaseUrl(parsed.baseUrl);
    if (parsed.params.length > 0) setQueryParams(parsed.params);
  };

  const addParam = () => {
    setQueryParams((prev) => [
      ...prev,
      {
        id: `param-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        key: "",
        value: "",
        enabled: true,
      },
    ]);
  };

  const updateParam = (id: string, updates: Partial<QueryParamItem>) => {
    setQueryParams((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeParam = (id: string) => {
    setQueryParams((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("quick")}
          className={`px-4 py-2.5 font-medium text-sm transition-colors border-b-2 -mb-px ${
            activeTab === "quick"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Quick Encoder / Decoder
        </button>
        <button
          onClick={() => setActiveTab("params")}
          className={`px-4 py-2.5 font-medium text-sm transition-colors border-b-2 -mb-px ${
            activeTab === "params"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          URL & Query Parameter Editor
        </button>
      </div>

      {activeTab === "quick" && (
        <div className="space-y-5">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Mode:
              </span>
              <div className="inline-flex rounded-lg border border-border p-1 bg-muted/40">
                <button
                  type="button"
                  onClick={() => setEncodeMode("component")}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    encodeMode === "component"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Component (encodeURIComponent)
                </button>
                <button
                  type="button"
                  onClick={() => setEncodeMode("full")}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    encodeMode === "full"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Full URL (encodeURI)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setInputText("https://mindkit.dev/search?q=resume builder & fast tools#section-1")
                }
                className="text-xs text-primary hover:underline font-medium"
              >
                Sample URL
              </button>
              <span className="text-muted-foreground text-xs">•</span>
              <button
                type="button"
                onClick={() => setInputText("")}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Input text area */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Input String / URL
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste or type any string, URL, query param or encoded sequence..."
              rows={4}
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
            />
          </div>

          {/* Results: Encoded & Decoded */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Encoded */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Encoded Output
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(encodedResult, "encoded")}
                  disabled={!encodedResult}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
                >
                  {copiedField === "encoded" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-green-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-3 bg-muted/40 rounded-lg min-h-[90px] font-mono text-xs break-all select-all border border-border/50 text-foreground overflow-x-auto">
                {encodedResult || <span className="text-muted-foreground italic">Encoded output will appear here</span>}
              </div>
            </div>

            {/* Decoded */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Decoded Output
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(decodedResult.result, "decoded")}
                  disabled={!decodedResult.result}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
                >
                  {copiedField === "decoded" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-green-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-3 bg-muted/40 rounded-lg min-h-[90px] font-mono text-xs break-all select-all border border-border/50 text-foreground overflow-x-auto">
                {decodedResult.error ? (
                  <span className="text-destructive font-sans">{decodedResult.error}</span>
                ) : decodedResult.result ? (
                  decodedResult.result
                ) : (
                  <span className="text-muted-foreground italic">Decoded output will appear here</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "params" && (
        <div className="space-y-5">
          {/* Quick Import */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wide">
              Base URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={paramBaseUrl}
                onChange={(e) => setParamBaseUrl(e.target.value)}
                placeholder="https://example.com/api"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <button
                type="button"
                onClick={() => handleImportUrl(paramBaseUrl)}
                className="px-3.5 py-2 text-xs font-medium bg-muted hover:bg-muted/80 text-foreground rounded-lg border border-border transition-colors whitespace-nowrap"
              >
                Extract Params
              </button>
            </div>
          </div>

          {/* Parameters Table */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Query Parameters ({queryParams.filter((p) => p.enabled).length} active)
              </span>
              <button
                type="button"
                onClick={addParam}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Parameter
              </button>
            </div>

            <div className="space-y-2">
              {queryParams.map((param) => (
                <div key={param.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={param.enabled}
                    onChange={(e) => updateParam(param.id, { enabled: e.target.checked })}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <input
                    type="text"
                    placeholder="Key"
                    value={param.key}
                    onChange={(e) => updateParam(param.id, { key: e.target.value })}
                    className="w-1/3 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={param.value}
                    onChange={(e) => updateParam(param.id, { value: e.target.value })}
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => removeParam(param.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive rounded transition-colors"
                    title="Remove parameter"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {queryParams.length === 0 && (
                <p className="text-xs text-muted-foreground py-3 text-center italic">
                  No query parameters added yet. Click &ldquo;Add Parameter&rdquo; above.
                </p>
              )}
            </div>
          </div>

          {/* Generated Complete URL */}
          <div className="rounded-xl border border-primary/20 bg-primary/[0.02] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Constructed URL Preview
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => copyToClipboard(generatedUrl, "constructed")}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline transition-colors"
                >
                  {copiedField === "constructed" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-green-600">Copied URL</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Full URL</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="p-3 bg-background rounded-lg border border-border font-mono text-xs break-all select-all text-foreground">
              {generatedUrl}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
