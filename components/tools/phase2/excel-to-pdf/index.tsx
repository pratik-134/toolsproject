"use client";

import React, { useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  parseSpreadsheetText,
  convertTableToPdf,
  SAMPLE_SPREADSHEETS,
  ExcelToPdfConfig,
} from "./logic";
import {
  FileSpreadsheet,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Table as TableIcon,
  Palette,
  LayoutTemplate,
} from "lucide-react";

const THEME_COLORS: { name: string; hex: string }[] = [
  { name: "Indigo Blue", hex: "2563EB" },
  { name: "Executive Slate", hex: "1E293B" },
  { name: "Modern Emerald", hex: "059669" },
  { name: "Crimson Red", hex: "DC2626" },
  { name: "Royal Purple", hex: "7C3AED" },
];

export default function ExcelToPdfTool() {
  const [title, setTitle] = useState<string>("Q3 Fiscal Performance Summary");
  const [subtitle, setSubtitle] = useState<string>("Departmental Revenue, Cost of Goods & Net Margin");
  const [csvText, setCsvText] = useState<string>(SAMPLE_SPREADSHEETS["Financial Summary"]?.csv ?? "");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("landscape");
  const [headerColor, setHeaderColor] = useState<string>("2563EB");
  const [zebraStriping, setZebraStriping] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Parse table rows
  const parsedRows = useMemo(() => {
    return parseSpreadsheetText(csvText);
  }, [csvText]);

  const loadSample = (sampleKey: string) => {
    const s = SAMPLE_SPREADSHEETS[sampleKey];
    if (s) {
      setTitle(s.title);
      setSubtitle(s.subtitle);
      setCsvText(s.csv);
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        setCsvText(text);
        setTitle(file.name.replace(/\.[^/.]+$/, " Report"));
      }
    };
    reader.readAsText(file);
  };

  const handleDownload = async () => {
    if (parsedRows.length === 0) return;
    setIsGenerating(true);
    try {
      const config: ExcelToPdfConfig = {
        title,
        subtitle,
        orientation,
        headerColorHex: headerColor,
        zebraStriping,
        fontSize: 9,
      };

      const pdfBytes = await convertTableToPdf(parsedRows, config);
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "spreadsheet"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      alert("Error generating table PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Privacy guarantee badge */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-medium">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        <span>
          100% In-Browser Spreadsheet to PDF Converter — Confidential financial tables and lists are compiled locally in RAM.
        </span>
      </div>

      {/* Preset Pickers */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 p-3 rounded-xl border border-border">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Sample Datasets:
        </span>
        <div className="flex flex-wrap gap-2">
          {Object.keys(SAMPLE_SPREADSHEETS).map((key) => (
            <button
              key={key}
              onClick={() => loadSample(key)}
              className="text-xs px-3 py-1.5 rounded-lg bg-card hover:bg-accent border border-border transition-colors font-medium text-foreground"
            >
              {key}
            </button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setTitle("");
              setSubtitle("");
              setCsvText("");
            }}
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Data Input & Configuration */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 bg-card border border-border rounded-xl space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b border-border">
              <FileSpreadsheet className="w-4 h-4 text-primary" />
              Spreadsheet Settings
            </h3>

            {/* Document Title & Subtitle */}
            <div className="space-y-2 text-xs">
              <div>
                <label className="text-muted-foreground block mb-1">Document Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-muted/30 border border-border rounded-lg text-foreground font-semibold text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="e.g. Sales Report"
                />
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">Subtitle</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-muted/30 border border-border rounded-lg text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="e.g. Q3 Regional Breakdown"
                />
              </div>

              {/* Orientation & Theme */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-muted-foreground block mb-1">Page Orientation</label>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      onClick={() => setOrientation("portrait")}
                      className={`py-1 text-[11px] rounded border font-medium transition-colors ${
                        orientation === "portrait"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/40 border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      Portrait
                    </button>
                    <button
                      onClick={() => setOrientation("landscape")}
                      className={`py-1 text-[11px] rounded border font-medium transition-colors ${
                        orientation === "landscape"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/40 border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      Landscape
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1">Header Accent</label>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    {THEME_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => setHeaderColor(c.hex)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                          headerColor === c.hex ? "scale-110 border-foreground shadow-sm" : "border-transparent"
                        }`}
                        style={{ backgroundColor: `#${c.hex}` }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Zebra Striping toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none text-muted-foreground hover:text-foreground pt-1">
                <input
                  type="checkbox"
                  checked={zebraStriping}
                  onChange={(e) => setZebraStriping(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                />
                <span>Zebra Striping (Alternating row backgrounds)</span>
              </label>
            </div>

            {/* CSV Data Textarea & Upload */}
            <div className="pt-2 border-t border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Raw CSV / TSV Data
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.tsv,.txt"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUpload(f);
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-6 text-[11px] gap-1"
                >
                  <Upload className="w-3 h-3" />
                  Upload CSV
                </Button>
              </div>

              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="Paste CSV data here..."
                rows={8}
                className="w-full p-2.5 font-mono text-xs bg-muted/20 border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-none resize-y"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Table Preview & Export */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 bg-card border border-border rounded-xl min-h-[460px] flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <TableIcon className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">
                    Table Preview ({parsedRows.length} rows, {parsedRows[0]?.length || 0} columns)
                  </span>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleDownload}
                  disabled={isGenerating || parsedRows.length === 0}
                  className="h-7 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Download className="w-3.5 h-3.5" />
                  {isGenerating ? "Compiling PDF..." : "Export Vector PDF"}
                </Button>
              </div>

              {/* Rendered HTML Table Sheet */}
              <div className="mt-3 p-4 bg-white dark:bg-slate-900 border border-border rounded-lg shadow-sm max-h-[360px] overflow-auto text-xs">
                {title && (
                  <h2
                    className="text-sm font-bold pb-0.5"
                    style={{ color: `#${headerColor}` }}
                  >
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="text-[11px] text-slate-500 pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
                    {subtitle}
                  </p>
                )}

                {parsedRows.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    No spreadsheet data parsed. Paste CSV rows on the left.
                  </p>
                ) : (
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr style={{ backgroundColor: `#${headerColor}`, color: "#ffffff" }}>
                        {parsedRows[0]?.map((head, i) => (
                          <th key={i} className="p-2 font-bold whitespace-nowrap">
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedRows.slice(1).map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className={`border-b border-slate-200 dark:border-slate-800 ${
                            zebraStriping && rIdx % 2 === 1
                              ? "bg-slate-50 dark:bg-slate-800/40"
                              : ""
                          }`}
                        >
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-2 whitespace-nowrap text-slate-700 dark:text-slate-300">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Automatic multi-page pagination &amp; repeating headers</span>
              <span>Vector PDF Export (`pdf-lib`)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
