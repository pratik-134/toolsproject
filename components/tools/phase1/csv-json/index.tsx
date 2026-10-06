"use client";

import React, { useState, useMemo } from "react";
import { csvToJson, jsonToCsv } from "./logic";
import { Copy, Check, Download, ArrowRightLeft, Sparkles, Trash2, FileSpreadsheet, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SendToPipelineButton } from "@/components/pipeline/SendToPipelineButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SAMPLE_CSV = `id,name,role,department,salary,remote
101,Alice Walker,Staff Architect,Platform,165000,true
102,David Chen,Senior Engineer,Frontend,142000,true
103,"Miller, Sarah",Lead Designer,Product,138000,false`;

const SAMPLE_JSON = `[
  {
    "id": 101,
    "name": "Alice Walker",
    "role": "Staff Architect",
    "department": "Platform",
    "salary": 165000,
    "remote": true
  },
  {
    "id": 102,
    "name": "David Chen",
    "role": "Senior Engineer",
    "department": "Frontend",
    "salary": 142000,
    "remote": true
  }
]`;

export default function CsvJsonConverterTool() {
  const [direction, setDirection] = useState<"csv-to-json" | "json-to-csv">("csv-to-json");
  const [input, setInput] = useState<string>(SAMPLE_CSV);
  const [delimiter, setDelimiter] = useState<string>(",");
  const [hasHeaders, setHasHeaders] = useState<boolean>(true);
  const [parseTypes, setParseTypes] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const result = useMemo(() => {
    if (direction === "csv-to-json") {
      return csvToJson(input, {
        delimiter,
        hasHeaders,
        parseNumbersAndBooleans: parseTypes,
      });
    } else {
      return jsonToCsv(input, {
        delimiter,
        includeHeaders: hasHeaders,
      });
    }
  }, [direction, input, delimiter, hasHeaders, parseTypes]);

  const handleCopy = async () => {
    if (!result.output) return;
    await navigator.clipboard.writeText(result.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result.output) return;
    const isCsvOutput = direction === "json-to-csv";
    const mime = isCsvOutput ? "text/csv;charset=utf-8;" : "application/json";
    const ext = isCsvOutput ? "csv" : "json";
    const blob = new Blob([result.output], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qwertygen-converted.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleDirection = () => {
    if (direction === "csv-to-json") {
      setDirection("json-to-csv");
      setInput(result.output || SAMPLE_JSON);
    } else {
      setDirection("csv-to-json");
      setInput(result.output || SAMPLE_CSV);
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setDirection("csv-to-json");
                setInput(SAMPLE_CSV);
              }}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                direction === "csv-to-json"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              CSV → JSON
            </button>
            <button
              type="button"
              onClick={() => {
                setDirection("json-to-csv");
                setInput(SAMPLE_JSON);
              }}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                direction === "json-to-csv"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              JSON → CSV
            </button>
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            <label className="text-xs font-semibold text-slate-600">Delimiter:</label>
            <Select value={delimiter} onValueChange={setDelimiter}>
              <SelectTrigger className="h-7 w-28 text-xs font-semibold bg-white border-slate-300">
                <SelectValue placeholder="Delimiter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=",">Comma (,)</SelectItem>
                <SelectItem value=";">Semicolon (;)</SelectItem>
                <SelectItem value={"\t"}>Tab (\t)</SelectItem>
                <SelectItem value="|">Pipe (|)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <label className="inline-flex items-center gap-1.5 ml-3 cursor-pointer text-xs font-medium text-slate-700 select-none">
            <input
              type="checkbox"
              checked={hasHeaders}
              onChange={(e) => setHasHeaders(e.target.checked)}
              className="rounded border-slate-300 text-blue-600"
            />
            <span>Headers in Row 1</span>
          </label>

          {direction === "csv-to-json" && (
            <label className="inline-flex items-center gap-1.5 ml-2 cursor-pointer text-xs font-medium text-slate-700 select-none">
              <input
                type="checkbox"
                checked={parseTypes}
                onChange={(e) => setParseTypes(e.target.checked)}
                className="rounded border-slate-300 text-blue-600"
              />
              <span>Auto-detect Numbers</span>
            </label>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={toggleDirection}
            className="text-xs h-8 gap-1.5 text-slate-700"
          >
            <ArrowRightLeft className="h-3.5 w-3.5 text-blue-600" />
            <span>Swap</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setInput("")}
            className="text-xs h-8 gap-1 text-slate-500 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear</span>
          </Button>
        </div>
      </div>

      {/* Editor & Output Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/60">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileSpreadsheet className="h-4 w-4 text-blue-600" />
              {direction === "csv-to-json" ? "CSV Source" : "JSON Source"}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {input.length} chars
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              direction === "csv-to-json"
                ? "Paste comma-separated CSV text here..."
                : "Paste JSON array of objects here..."
            }
            rows={16}
            spellCheck={false}
            className="w-full p-4 font-mono text-xs sm:text-sm text-slate-800 bg-transparent resize-y focus:outline-none min-h-[340px]"
          />
        </div>

        {/* Output */}
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {direction === "csv-to-json" ? "Converted JSON" : "Converted CSV"}
              </span>
              {result.success && result.rowsCount !== undefined && (
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                  {result.rowsCount} records
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
                disabled={!result.success || !result.output}
                className="text-xs h-7 px-2.5 gap-1"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
              {result.success && result.output && (
                <SendToPipelineButton
                  sourceSlug="csv-json"
                  sourceToolName="CSV to JSON Converter"
                  dataType="text"
                  textData={result.output}
                  fileName={direction === "csv-to-json" ? "data.json" : "data.csv"}
                  title="Export from CSV to JSON"
                />
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownload}
                disabled={!result.success || !result.output}
                className="text-xs h-7 px-2.5 gap-1"
              >
                <Download className="h-3 w-3" />
                <span>Save</span>
              </Button>
            </div>
          </div>

          {result.success ? (
            <textarea
              readOnly
              value={result.output}
              placeholder="Conversion results will appear here..."
              rows={16}
              spellCheck={false}
              className="w-full p-4 font-mono text-xs sm:text-sm text-slate-800 bg-slate-50/30 resize-y focus:outline-none min-h-[340px]"
            />
          ) : (
            <div className="p-4 bg-red-50/60 text-red-700 border-l-4 border-red-500 font-mono text-xs space-y-2 min-h-[340px]">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span>Conversion Error:</span>
              </div>
              <p>{result.error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
