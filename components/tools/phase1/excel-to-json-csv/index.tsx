"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  ExcelSheet,
  ExcelWorkbook,
  JsonExportFormat,
  parseXlsxBuffer,
  parseDelimitedText,
  sheetToJson,
  sheetToCsv,
} from "./logic";
import {
  FileSpreadsheet,
  FileText,
  Code,
  Table,
  Upload,
  Copy,
  Check,
  Download,
  Trash2,
  Search,
  Layers,
  ShieldCheck,
} from "lucide-react";

const SAMPLE_SHEETS: { name: string; sheet: ExcelSheet }[] = [
  {
    name: "Sales Pipeline 2026",
    sheet: {
      name: "Q1 Deals",
      columns: ["Deal ID", "Account Name", "Stage", "Value ($)", "Probability", "Close Date"],
      rows: [
        ["DEAL-101", "Acme Global", "Negotiation", 75000, "80%", "2026-03-31"],
        ["DEAL-102", "Nova Corp", "Proposal Sent", 42000, "50%", "2026-04-15"],
        ["DEAL-103", "Starlight Systems", "Closed Won", 120000, "100%", "2026-02-28"],
        ["DEAL-104", "Beacon Health", "Discovery", 18500, "30%", "2026-05-10"],
      ],
    },
  },
  {
    name: "Employee Roster",
    sheet: {
      name: "Engineering",
      columns: ["Emp ID", "Full Name", "Department", "Role", "Location", "Status"],
      rows: [
        ["EMP-001", "Liam Vance", "Core Infrastructure", "Staff SRE", "San Francisco, CA", "Active"],
        ["EMP-002", "Sophia Kim", "Frontend Systems", "Senior UI Engineer", "Seattle, WA", "Active"],
        ["EMP-003", "Mateo Silva", "Security", "AppSec Specialist", "Austin, TX", "Active"],
        ["EMP-004", "Chloe Moreau", "Product Design", "Design Lead", "Remote (NYC)", "Active"],
      ],
    },
  },
  {
    name: "Product Inventory",
    sheet: {
      name: "Warehouse A",
      columns: ["SKU", "Item Description", "Category", "Unit Cost", "Stock Qty", "Reorder Level"],
      rows: [
        ["SKU-901", "Ultra-light Wireless Mouse", "Peripherals", 24.50, 480, 100],
        ["SKU-902", "Mechanical Keycaps (PBT)", "Accessories", 14.00, 210, 50],
        ["SKU-903", "Noise-Cancelling Headset", "Audio", 89.00, 65, 30],
        ["SKU-904", "Braided USB-C Cable (2m)", "Cables", 3.20, 1200, 300],
      ],
    },
  },
];

export default function ExcelToJsonCsvTool() {
  const [workbook, setWorkbook] = useState<ExcelWorkbook>({
    sheets: [SAMPLE_SHEETS[0]!.sheet],
    activeSheetIndex: 0,
  });
  const [fileName, setFileName] = useState<string>("Sample_Pipeline.xlsx");
  const [activeTab, setActiveTab] = useState<"table" | "json" | "csv">("table");
  const [jsonFormat, setJsonFormat] = useState<JsonExportFormat>("objects");
  const [csvDelimiter, setCsvDelimiter] = useState<string>(",");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeSheet: ExcelSheet = useMemo(() => {
    return workbook.sheets[workbook.activeSheetIndex] || {
      name: "Sheet1",
      columns: [],
      rows: [],
    };
  }, [workbook]);

  // Filtered rows for tabular preview search
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return activeSheet.rows;
    const q = searchQuery.toLowerCase();
    return activeSheet.rows.filter((row) =>
      row.some((cell) => cell !== null && String(cell).toLowerCase().includes(q))
    );
  }, [activeSheet, searchQuery]);

  // Export conversions
  const jsonOutput = useMemo(() => {
    return sheetToJson(activeSheet, jsonFormat);
  }, [activeSheet, jsonFormat]);

  const csvOutput = useMemo(() => {
    return sheetToCsv(activeSheet, csvDelimiter);
  }, [activeSheet, csvDelimiter]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert("File exceeds 25MB maximum size.");
      return;
    }

    setIsProcessing(true);
    setFileName(file.name);

    try {
      if (file.name.endsWith(".xlsx")) {
        const arrayBuffer = await file.arrayBuffer();
        const parsed = parseXlsxBuffer(arrayBuffer);
        setWorkbook(parsed);
      } else {
        // CSV or TSV text
        const text = await file.text();
        const delim = file.name.endsWith(".tsv") ? "\t" : ",";
        const sheet = parseDelimitedText(text, delim);
        setWorkbook({
          sheets: [sheet],
          activeSheetIndex: 0,
        });
      }
    } catch (err) {
      alert(`Failed to parse file: ${(err as Error).message}`);
    } finally {
      setIsProcessing(false);
      e.target.value = "";
    }
  };

  const handleCopy = () => {
    const content = activeTab === "json" ? jsonOutput : csvOutput;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const isJson = activeTab === "json";
    const content = isJson ? jsonOutput : csvOutput;
    const extension = isJson ? "json" : csvDelimiter === "\t" ? "tsv" : "csv";
    const mime = isJson ? "application/json" : "text/csv;charset=utf-8;";

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeSheet.name.replace(/[^a-zA-Z0-9_-]/g, "_")}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header: Presets and File Upload */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
            Presets:
          </span>
          {SAMPLE_SHEETS.map((s) => (
            <button
              key={s.name}
              onClick={() => {
                setWorkbook({ sheets: [s.sheet], activeSheetIndex: 0 });
                setFileName(`${s.name}.xlsx`);
              }}
              className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-slate-700 hover:text-blue-700 transition"
            >
              {s.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx,.csv,.tsv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            Upload .XLSX or .CSV
          </button>
          <button
            onClick={() => {
              setWorkbook({ sheets: [{ name: "Blank", columns: [], rows: [] }], activeSheetIndex: 0 });
              setFileName("Empty");
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-700 transition shadow-2xs"
            title="Clear data"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        {/* Workbook Meta & Sheet Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <div>
              <div className="text-sm font-bold text-slate-900">{fileName}</div>
              <div className="text-xs text-slate-500 font-medium">
                {activeSheet.rows.length} rows &bull; {activeSheet.columns.length} columns &bull; 100% Client-side
              </div>
            </div>
          </div>

          {/* Multi-Sheet Selection Pills */}
          {workbook.sheets.length > 1 && (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <span className="text-[11px] font-bold text-slate-500 uppercase px-2 flex items-center gap-1">
                <Layers className="w-3 h-3" />
                Sheets:
              </span>
              {workbook.sheets.map((sh, idx) => (
                <button
                  key={sh.name}
                  onClick={() => setWorkbook((prev) => ({ ...prev, activeSheetIndex: idx }))}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                    workbook.activeSheetIndex === idx
                      ? "bg-white text-emerald-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {sh.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Mode Controls & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Format Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === "table" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Table className="w-3.5 h-3.5 text-emerald-600" />
              Table Grid
            </button>
            <button
              onClick={() => setActiveTab("json")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === "json" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Code className="w-3.5 h-3.5 text-blue-600" />
              JSON
            </button>
            <button
              onClick={() => setActiveTab("csv")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === "csv" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              CSV / TSV
            </button>
          </div>

          {/* Contextual Options depending on tab */}
          <div className="flex items-center gap-3">
            {activeTab === "table" && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter rows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500 w-48"
                />
              </div>
            )}

            {activeTab === "json" && (
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setJsonFormat("objects")}
                  className={`px-2 py-1 rounded transition ${
                    jsonFormat === "objects" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
                  }`}
                >
                  Object Array
                </button>
                <button
                  onClick={() => setJsonFormat("arrays")}
                  className={`px-2 py-1 rounded transition ${
                    jsonFormat === "arrays" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
                  }`}
                >
                  2D Matrix
                </button>
              </div>
            )}

            {activeTab === "csv" && (
              <select
                value={csvDelimiter}
                onChange={(e) => setCsvDelimiter(e.target.value)}
                className="px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white text-slate-800"
              >
                <option value=",">Comma (,)</option>
                <option value="&#9;">Tab (\t)</option>
                <option value=";">Semicolon (;)</option>
              </select>
            )}

            {activeTab !== "table" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  Download
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Contents */}
        {activeTab === "table" && (
          <div className="overflow-x-auto max-h-96 border border-slate-200 rounded-xl">
            {activeSheet.columns.length > 0 ? (
              <table className="w-full text-xs text-left">
                <thead className="sticky top-0 bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 text-[10px] text-slate-400 font-mono">#</th>
                    {activeSheet.columns.map((c, i) => (
                      <th key={i} className="py-2.5 px-3 whitespace-nowrap">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50/80">
                      <td className="py-2 px-3 text-[10px] text-slate-400 font-mono">{rIdx + 1}</td>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="py-2 px-3 whitespace-nowrap text-slate-800">
                          {cell === null ? (
                            <span className="text-slate-300 font-mono text-[10px]">-</span>
                          ) : typeof cell === "boolean" ? (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${cell ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                              {String(cell)}
                            </span>
                          ) : (
                            String(cell)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-sm text-slate-500">
                No worksheet data loaded. Upload an Excel or CSV file.
              </div>
            )}
          </div>
        )}

        {activeTab === "json" && (
          <textarea
            readOnly
            value={jsonOutput}
            className="w-full h-96 px-3.5 py-3 text-xs font-mono text-slate-900 bg-slate-50 border border-slate-200 rounded-xl resize-y leading-relaxed outline-hidden"
            spellCheck={false}
          />
        )}

        {activeTab === "csv" && (
          <textarea
            readOnly
            value={csvOutput}
            className="w-full h-96 px-3.5 py-3 text-xs font-mono text-slate-900 bg-slate-50 border border-slate-200 rounded-xl resize-y leading-relaxed outline-hidden"
            spellCheck={false}
          />
        )}

        {/* Privacy Invariant Banner */}
        <div className="p-3 bg-emerald-50/80 border border-emerald-200/60 rounded-xl flex gap-2 items-center text-xs text-emerald-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>100% Local Processing:</strong> Spreadsheets are parsed in your browser memory via WebAssembly/pure JavaScript. Zero data is ever uploaded to any server.
          </span>
        </div>
      </div>
    </div>
  );
}
