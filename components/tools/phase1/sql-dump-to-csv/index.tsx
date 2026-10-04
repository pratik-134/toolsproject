"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  parseSqlDump,
  SqlParseOptions,
  SqlParseResult,
  DelimiterType,
  NullRepresentation,
} from "./logic";
import {
  Copy,
  Check,
  Download,
  Database,
  Table,
  FileText,
  Code,
  Upload,
  Trash2,
  Settings2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SAMPLE_PRESETS: { name: string; sql: string }[] = [
  {
    name: "E-Commerce Customers (MySQL)",
    sql: `INSERT INTO \`customers\` (\`id\`, \`name\`, \`email\`, \`city\`, \`spend_total\`, \`is_vip\`) VALUES
(1, 'Alice Smith', 'alice@example.com', 'San Francisco', 1420.50, 1),
(2, 'Bob O''Connor', 'bob@example.com', 'New York, NY', 890.00, 0),
(3, 'Charlie Zhang', 'charlie@example.com', 'Seattle', NULL, 0),
(4, 'Diana Prince', 'diana@themyscira.gov', 'Washington\\nD.C.', 4500.75, 1);`,
  },
  {
    name: "Product Inventory (PostgreSQL)",
    sql: `INSERT INTO "products" ("sku", "title", "category", "price", "stock_qty") VALUES
('SKU-1001', 'Wireless Mechanical Keyboard', 'Peripherals', 129.99, 45),
('SKU-1002', 'Ergonomic Vertical Mouse', 'Peripherals', 59.95, 120),
('SKU-2001', '4K Ultra-Wide Monitor (34")', 'Displays', 499.00, 18),
('SKU-3001', 'USB-C Dual Hub', 'Accessories', 39.50, 80);`,
  },
  {
    name: "Multi-Table Relational Dump",
    sql: `INSERT INTO \`departments\` (\`dept_id\`, \`dept_name\`, \`budget\`) VALUES
(10, 'Engineering', 750000),
(20, 'Product Design', 320000);

INSERT INTO \`employees\` (\`emp_id\`, \`name\`, \`dept_id\`, \`role\`) VALUES
(101, 'Elena Rostova', 10, 'Principal Architect'),
(102, 'Marcus Vance', 10, 'Systems Engineer'),
(103, 'Aria Sterling', 20, 'Lead UX Designer');`,
  },
];

export default function SqlDumpToCsvTool() {
  const [sqlInput, setSqlInput] = useState<string>(SAMPLE_PRESETS[0]?.sql || "");
  const [targetTable, setTargetTable] = useState<string>("");
  const [delimiter, setDelimiter] = useState<DelimiterType>(",");
  const [nullValue, setNullValue] = useState<NullRepresentation>("");
  const [includeHeaders, setIncludeHeaders] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"csv" | "table" | "json">("csv");
  const [copied, setCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const options: SqlParseOptions = useMemo(
    () => ({
      delimiter,
      includeHeaders,
      nullValue,
      targetTable: targetTable || undefined,
    }),
    [delimiter, includeHeaders, nullValue, targetTable]
  );

  const result: SqlParseResult = useMemo(() => {
    try {
      return parseSqlDump(sqlInput, options);
    } catch {
      return {
        tables: {},
        tableNames: [],
        activeTable: "",
        columns: [],
        rows: [],
        csv: "",
        json: "[]",
        totalStatements: 0,
        totalRows: 0,
      };
    }
  }, [sqlInput, options]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert("File size exceeds 20MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setSqlInput(text);
        setTargetTable(""); // Reset table selector to first discovered
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleCopy = () => {
    const content = activeTab === "json" ? result.json : result.csv;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const isJson = activeTab === "json";
    const content = isJson ? result.json : result.csv;
    const extension = isJson ? "json" : delimiter === "\t" ? "tsv" : "csv";
    const mime = isJson ? "application/json" : "text/csv;charset=utf-8;";

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${result.activeTable || "export"}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Ribbon: Presets & File Upload */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
            Presets:
          </span>
          {SAMPLE_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => {
                setSqlInput(p.sql);
                setTargetTable("");
              }}
              className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-slate-700 hover:text-blue-700 transition"
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".sql,.txt"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            Upload .SQL File
          </button>
          <button
            onClick={() => {
              setSqlInput("");
              setTargetTable("");
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-700 transition shadow-2xs"
            title="Clear Input"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Main Grid: Input & Options vs. Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Textarea & Configuration */}
        <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              SQL Input (INSERT INTO Statements)
            </h2>
            <span className="text-[11px] text-slate-500 font-mono">
              {sqlInput.length.toLocaleString()} chars
            </span>
          </div>

          <textarea
            value={sqlInput}
            onChange={(e) => setSqlInput(e.target.value)}
            placeholder="Paste your SQL INSERT statements here..."
            className="w-full h-80 px-3.5 py-3 text-xs font-mono text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white resize-y leading-relaxed outline-hidden"
            spellCheck={false}
          />

          {/* Conversion Options */}
          <div className="pt-3 border-t border-slate-200 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <Settings2 className="w-3.5 h-3.5 text-slate-500" />
              CSV Export Formatting
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Table Selection Dropdown */}
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Target Table</label>
                <Select
                  value={targetTable || result.activeTable || (result.tableNames[0] ?? "")}
                  onValueChange={setTargetTable}
                  disabled={result.tableNames.length <= 1}
                >
                  <SelectTrigger className="w-full h-8 text-xs bg-white border-slate-300">
                    <SelectValue placeholder="Select Table" />
                  </SelectTrigger>
                  <SelectContent>
                    {result.tableNames.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t} ({result.tables[t]?.rows.length || 0} rows)
                      </SelectItem>
                    ))}
                    {result.tableNames.length === 0 && <SelectItem value="none">(No tables found)</SelectItem>}
                  </SelectContent>
                </Select>
              </div>

              {/* Delimiter */}
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Delimiter</label>
                <Select
                  value={delimiter}
                  onValueChange={(val) => setDelimiter(val as DelimiterType)}
                >
                  <SelectTrigger className="w-full h-8 text-xs bg-white border-slate-300">
                    <SelectValue placeholder="Delimiter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=",">Comma (,)</SelectItem>
                    <SelectItem value={"\t"}>Tab (\t)</SelectItem>
                    <SelectItem value=";">Semicolon (;)</SelectItem>
                    <SelectItem value="|">Pipe (|)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* NULL Representation */}
              <div>
                <label className="text-slate-600 font-semibold block mb-1">NULL Value As</label>
                <Select
                  value={nullValue === "" ? "EMPTY_STRING" : nullValue}
                  onValueChange={(val) => setNullValue(val === "EMPTY_STRING" ? "" : (val as NullRepresentation))}
                >
                  <SelectTrigger className="w-full h-8 text-xs bg-white border-slate-300">
                    <SelectValue placeholder="NULL Value" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPTY_STRING">Empty String ("")</SelectItem>
                    <SelectItem value="NULL">NULL</SelectItem>
                    <SelectItem value="\N">\N (MySQL)</SelectItem>
                    <SelectItem value="null">null</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="includeHeaders"
                checked={includeHeaders}
                onChange={(e) => setIncludeHeaders(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="includeHeaders" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Include column headers in first row
              </label>
            </div>
          </div>
        </div>

        {/* Right: Output Tabs & Preview */}
        <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("csv")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition ${
                  activeTab === "csv" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                CSV Output
              </button>
              <button
                onClick={() => setActiveTab("table")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition ${
                  activeTab === "table" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Table className="w-3.5 h-3.5 text-emerald-600" />
                Table Grid
              </button>
              <button
                onClick={() => setActiveTab("json")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition ${
                  activeTab === "json" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Code className="w-3.5 h-3.5 text-amber-600" />
                JSON
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                disabled={result.rows.length === 0}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition disabled:opacity-50"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                onClick={handleDownload}
                disabled={result.rows.length === 0}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                Download
              </button>
            </div>
          </div>

          {/* Stats Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 font-bold">
              Table: {result.activeTable || "None"}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold">
              {result.rows.length} Rows
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold">
              {result.columns.length} Columns
            </span>
          </div>

          {/* View Tab Contents */}
          {activeTab === "csv" && (
            <textarea
              readOnly
              value={result.csv}
              placeholder="CSV output will appear here..."
              className="w-full h-80 px-3.5 py-3 text-xs font-mono text-slate-900 bg-slate-50 border border-slate-200 rounded-xl resize-y leading-relaxed outline-hidden"
              spellCheck={false}
            />
          )}

          {activeTab === "json" && (
            <textarea
              readOnly
              value={result.json}
              placeholder="JSON output will appear here..."
              className="w-full h-80 px-3.5 py-3 text-xs font-mono text-slate-900 bg-slate-50 border border-slate-200 rounded-xl resize-y leading-relaxed outline-hidden"
              spellCheck={false}
            />
          )}

          {activeTab === "table" && (
            <div className="h-80 overflow-auto border border-slate-200 rounded-xl">
              {result.rows.length > 0 ? (
                <table className="w-full text-xs text-left">
                  <thead className="sticky top-0 bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3 text-[10px] text-slate-400 font-mono">#</th>
                      {result.columns.map((c, i) => (
                        <th key={i} className="py-2 px-3 whitespace-nowrap">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {result.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/80">
                        <td className="py-1.5 px-3 text-[10px] text-slate-400 font-mono">
                          {rIdx + 1}
                        </td>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="py-1.5 px-3 whitespace-nowrap text-slate-800">
                            {cell === null ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-100 text-amber-800">
                                null
                              </span>
                            ) : (
                              cell
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">
                  No valid table rows found to preview.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
