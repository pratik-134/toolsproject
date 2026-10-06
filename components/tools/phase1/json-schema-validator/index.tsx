"use client";

import React, { useState, useMemo } from "react";
import { CheckCircle2, XCircle, AlertCircle, FileJson, Sparkles, Layers } from "lucide-react";
import { validateJsonSchema, ValidationResult } from "./logic";

const SAMPLES = [
  {
    name: "User Account Schema",
    schema: JSON.stringify(
      {
        type: "object",
        required: ["id", "username", "email", "age"],
        properties: {
          id: { type: "integer", minimum: 1 },
          username: { type: "string", minLength: 3, maxLength: 20 },
          email: { type: "string", pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" },
          age: { type: "integer", minimum: 18 },
          role: { enum: ["admin", "member", "guest"] },
          skills: {
            type: "array",
            minItems: 1,
            items: { type: "string" },
          },
        },
      },
      null,
      2
    ),
    data: JSON.stringify(
      {
        id: 101,
        username: "alex_coder",
        email: "alex@qwertygen.com",
        age: 26,
        role: "member",
        skills: ["TypeScript", "Next.js", "Tailwind"],
      },
      null,
      2
    ),
  },
  {
    name: "Product Inventory Schema",
    schema: JSON.stringify(
      {
        type: "object",
        required: ["sku", "name", "price", "inStock"],
        properties: {
          sku: { type: "string", minLength: 4 },
          name: { type: "string" },
          price: { type: "number", minimum: 0 },
          inStock: { type: "boolean" },
        },
      },
      null,
      2
    ),
    data: JSON.stringify(
      {
        sku: "MK-500",
        name: "Wireless Mechanical Keyboard",
        price: 89.99,
        inStock: true,
      },
      null,
      2
    ),
  },
];

export default function JsonSchemaValidatorTool() {
  const [schemaText, setSchemaText] = useState<string>(SAMPLES[0]!.schema);
  const [dataText, setDataText] = useState<string>(SAMPLES[0]!.data);

  const { result, parseError } = useMemo(() => {
    let parsedSchema: unknown;
    let parsedData: unknown;

    try {
      parsedSchema = JSON.parse(schemaText);
    } catch {
      return { result: null, parseError: "Schema is not valid JSON syntax." };
    }

    try {
      parsedData = JSON.parse(dataText);
    } catch {
      return { result: null, parseError: "Data is not valid JSON syntax." };
    }

    try {
      const res = validateJsonSchema(parsedData, parsedSchema);
      return { result: res, parseError: null };
    } catch (err: unknown) {
      return {
        result: null,
        parseError: err instanceof Error ? err.message : "Schema validation error.",
      };
    }
  }, [schemaText, dataText]);

  return (
    <div className="space-y-6">
      {/* Sample Selector Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Load Example Schemas:
        </span>
        <div className="flex flex-wrap gap-2">
          {SAMPLES.map((s) => (
            <button
              key={s.name}
              type="button"
              onClick={() => {
                setSchemaText(s.schema);
                setDataText(s.data);
              }}
              className="px-3 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Validation Result Banner */}
      {parseError ? (
        <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="text-sm font-semibold">{parseError}</div>
        </div>
      ) : result ? (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 transition-colors ${
            result.isValid
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
              : "bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-800 dark:text-red-200"
          }`}
        >
          {result.isValid ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0" />
          )}
          <div>
            <div className="text-sm font-bold">
              {result.isValid
                ? "VALIDATION PASSED — JSON DATA FULLY COMPLIES WITH SCHEMA"
                : `VALIDATION FAILED — ${result.errors.length} SCHEMA VIOLATION(S) DETECTED`}
            </div>
            <div className="text-xs opacity-90 mt-0.5">
              {result.isValid
                ? "All required fields, types, and constraints match the schema specification."
                : "Inspect the detailed error list below to correct the payload."}
            </div>
          </div>
        </div>
      ) : null}

      {/* Error Details Table (if any) */}
      {result && result.errors.length > 0 && (
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-3">
          <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Detected Schema Violations ({result.errors.length})
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-950">
                <tr>
                  <th className="px-3 py-2">Property Path</th>
                  <th className="px-3 py-2">Validation Failure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {result.errors.map((err, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-950/60 transition-colors">
                    <td className="px-3 py-2 text-teal-600 dark:text-teal-400 font-bold whitespace-nowrap">
                      {err.path}
                    </td>
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-300 font-sans">
                      {err.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Side-by-side Editors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: JSON Schema */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600" /> JSON Schema Definition
            </label>
            <span className="text-xs text-slate-400 font-mono">{schemaText.length} chars</span>
          </div>
          <textarea
            value={schemaText}
            onChange={(e) => setSchemaText(e.target.value)}
            rows={16}
            placeholder="Paste your JSON Schema definition here..."
            className="w-full p-3 font-mono text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500 resize-y"
            spellCheck={false}
          />
        </div>

        {/* Right: Payload Data */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <FileJson className="w-4 h-4 text-teal-600" /> JSON Data Payload
            </label>
            <span className="text-xs text-slate-400 font-mono">{dataText.length} chars</span>
          </div>
          <textarea
            value={dataText}
            onChange={(e) => setDataText(e.target.value)}
            rows={16}
            placeholder="Paste your JSON payload data here to validate..."
            className="w-full p-3 font-mono text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500 resize-y"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
