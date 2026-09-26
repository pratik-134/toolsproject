"use client";

import React, { useState, useId } from "react";
import { Copy, Check, Terminal, Shield, RefreshCw } from "lucide-react";
import { calculateChmod, ChmodState, parseOctalInput } from "./logic";

const PRESETS = [
  { label: "755 (Script / Executable)", octal: "755", isDir: false },
  { label: "644 (Standard File)", octal: "644", isDir: false },
  { label: "777 (Full Public Access)", octal: "777", isDir: false },
  { label: "700 (Private Executable)", octal: "700", isDir: false },
  { label: "600 (Private File / Key)", octal: "600", isDir: false },
  { label: "400 (Owner Read Only)", octal: "400", isDir: false },
];

export default function ChmodCalculator() {
  const manualOctalInputId = useId();
  const isDirCheckboxId = useId();
  const setuidCheckboxId = useId();
  const setgidCheckboxId = useId();
  const stickyCheckboxId = useId();
  const [state, setState] = useState<ChmodState>({
    owner: { read: true, write: true, execute: true },
    group: { read: true, write: false, execute: true },
    others: { read: true, write: false, execute: true },
    special: { setuid: false, setgid: false, sticky: false },
    isDirectory: false,
  });

  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [manualOctal, setManualOctal] = useState("755");

  const result = calculateChmod(state);

  const handleToggle = (
    tier: "owner" | "group" | "others",
    perm: "read" | "write" | "execute"
  ) => {
    setState((prev) => {
      const next = {
        ...prev,
        [tier]: {
          ...prev[tier],
          [perm]: !prev[tier][perm],
        },
      };
      const res = calculateChmod(next);
      setManualOctal(res.octal);
      return next;
    });
  };

  const handleSpecialToggle = (bit: "setuid" | "setgid" | "sticky") => {
    setState((prev) => {
      const next = {
        ...prev,
        special: {
          ...prev.special,
          [bit]: !prev.special[bit],
        },
      };
      const res = calculateChmod(next);
      setManualOctal(next.special.setuid || next.special.setgid || next.special.sticky ? res.octal4 : res.octal);
      return next;
    });
  };

  const applyPreset = (octal: string, isDir: boolean) => {
    const parsed = parseOctalInput(octal);
    if (!parsed) return;
    setState((prev) => ({
      ...prev,
      ...parsed,
      isDirectory: isDir,
    }));
    setManualOctal(octal);
  };

  const handleManualOctalChange = (val: string) => {
    setManualOctal(val);
    const parsed = parseOctalInput(val);
    if (parsed) {
      setState((prev) => ({
        ...prev,
        ...parsed,
      }));
    }
  };

  const copyText = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Quick Presets */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-2">Presets:</span>
        {PRESETS.map((p) => (
          <button
            key={p.octal}
            onClick={() => applyPreset(p.octal, p.isDir)}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
              result.octal === p.octal
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Primary Results Display */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Octal */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Octal Value</span>
            <button
              onClick={() => copyText(result.octal, "octal")}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {copiedType === "octal" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-2 font-mono">
            {result.octal}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">4-digit: {result.octal4}</span>
        </div>

        {/* Symbolic */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Symbolic Notation</span>
            <button
              onClick={() => copyText(result.symbolic, "symbolic")}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {copiedType === "symbolic" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2 font-mono tracking-wider">
            {result.symbolic}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Equivalent ls -l string</span>
        </div>

        {/* Umask */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Calculated Umask</span>
            <button
              onClick={() => copyText(result.umask, "umask")}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {copiedType === "umask" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 mt-2 font-mono">
            {result.umask}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Creation mask complement</span>
        </div>
      </div>

      {/* Interactive Permission Grid */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Permission Matrix</h3>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <label htmlFor={manualOctalInputId} className="text-xs font-semibold text-slate-500">Octal Input:</label>
              <input
                id={manualOctalInputId}
                type="text"
                value={manualOctal}
                onChange={(e) => handleManualOctalChange(e.target.value)}
                maxLength={4}
                className="w-16 px-2 py-1 text-center font-mono text-sm rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <label htmlFor={isDirCheckboxId} className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                id={isDirCheckboxId}
                type="checkbox"
                checked={state.isDirectory}
                onChange={(e) => setState((p) => ({ ...p, isDirectory: e.target.checked }))}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              Directory (d)
            </label>
          </div>
        </div>

        {/* Matrix Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Owner */}
          <div className="p-4 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200">Owner (User)</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                {(state.owner.read ? 4 : 0) + (state.owner.write ? 2 : 0) + (state.owner.execute ? 1 : 0)}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-blue-100/50 dark:hover:bg-blue-900/20">
                <input
                  type="checkbox"
                  checked={state.owner.read}
                  onChange={() => handleToggle("owner", "read")}
                  className="rounded text-blue-600"
                />
                <span className="text-slate-700 dark:text-slate-300">Read (r - 4)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-blue-100/50 dark:hover:bg-blue-900/20">
                <input
                  type="checkbox"
                  checked={state.owner.write}
                  onChange={() => handleToggle("owner", "write")}
                  className="rounded text-blue-600"
                />
                <span className="text-slate-700 dark:text-slate-300">Write (w - 2)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-blue-100/50 dark:hover:bg-blue-900/20">
                <input
                  type="checkbox"
                  checked={state.owner.execute}
                  onChange={() => handleToggle("owner", "execute")}
                  className="rounded text-blue-600"
                />
                <span className="text-slate-700 dark:text-slate-300">Execute (x - 1)</span>
              </label>
            </div>
          </div>

          {/* Group */}
          <div className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200">Group</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                {(state.group.read ? 4 : 0) + (state.group.write ? 2 : 0) + (state.group.execute ? 1 : 0)}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20">
                <input
                  type="checkbox"
                  checked={state.group.read}
                  onChange={() => handleToggle("group", "read")}
                  className="rounded text-emerald-600"
                />
                <span className="text-slate-700 dark:text-slate-300">Read (r - 4)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20">
                <input
                  type="checkbox"
                  checked={state.group.write}
                  onChange={() => handleToggle("group", "write")}
                  className="rounded text-emerald-600"
                />
                <span className="text-slate-700 dark:text-slate-300">Write (w - 2)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20">
                <input
                  type="checkbox"
                  checked={state.group.execute}
                  onChange={() => handleToggle("group", "execute")}
                  className="rounded text-emerald-600"
                />
                <span className="text-slate-700 dark:text-slate-300">Execute (x - 1)</span>
              </label>
            </div>
          </div>

          {/* Others */}
          <div className="p-4 rounded-xl border border-purple-100 dark:border-purple-900/40 bg-purple-50/30 dark:bg-purple-950/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200">Others (Public)</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                {(state.others.read ? 4 : 0) + (state.others.write ? 2 : 0) + (state.others.execute ? 1 : 0)}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-purple-100/50 dark:hover:bg-purple-900/20">
                <input
                  type="checkbox"
                  checked={state.others.read}
                  onChange={() => handleToggle("others", "read")}
                  className="rounded text-purple-600"
                />
                <span className="text-slate-700 dark:text-slate-300">Read (r - 4)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-purple-100/50 dark:hover:bg-purple-900/20">
                <input
                  type="checkbox"
                  checked={state.others.write}
                  onChange={() => handleToggle("others", "write")}
                  className="rounded text-purple-600"
                />
                <span className="text-slate-700 dark:text-slate-300">Write (w - 2)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-purple-100/50 dark:hover:bg-purple-900/20">
                <input
                  type="checkbox"
                  checked={state.others.execute}
                  onChange={() => handleToggle("others", "execute")}
                  className="rounded text-purple-600"
                />
                <span className="text-slate-700 dark:text-slate-300">Execute (x - 1)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Special Flags */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-3">
            Special Permissions (Advanced):
          </span>
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <label htmlFor={setuidCheckboxId} className="flex items-center gap-2 cursor-pointer">
              <input
                id={setuidCheckboxId}
                type="checkbox"
                checked={state.special.setuid}
                onChange={() => handleSpecialToggle("setuid")}
                className="rounded text-blue-600"
              />
              <span className="text-slate-700 dark:text-slate-300 font-mono text-xs">SetUID (4000)</span>
            </label>
            <label htmlFor={setgidCheckboxId} className="flex items-center gap-2 cursor-pointer">
              <input
                id={setgidCheckboxId}
                type="checkbox"
                checked={state.special.setgid}
                onChange={() => handleSpecialToggle("setgid")}
                className="rounded text-blue-600"
              />
              <span className="text-slate-700 dark:text-slate-300 font-mono text-xs">SetGID (2000)</span>
            </label>
            <label htmlFor={stickyCheckboxId} className="flex items-center gap-2 cursor-pointer">
              <input
                id={stickyCheckboxId}
                type="checkbox"
                checked={state.special.sticky}
                onChange={() => handleSpecialToggle("sticky")}
                className="rounded text-blue-600"
              />
              <span className="text-slate-700 dark:text-slate-300 font-mono text-xs">Sticky Bit (1000)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Terminal Command Output */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 font-mono text-xs space-y-3 shadow-md">
        <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
          <span className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" /> Linux Shell Commands
          </span>
          <span className="text-[11px] text-slate-400">{result.description}</span>
        </div>
        <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <code className="text-emerald-400 font-semibold">{result.commandNumeric}</code>
          <button
            onClick={() => copyText(result.commandNumeric, "cmd1")}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded hover:bg-slate-800"
          >
            {copiedType === "cmd1" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            Copy
          </button>
        </div>
        <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <code className="text-blue-400">{result.commandSymbolic}</code>
          <button
            onClick={() => copyText(result.commandSymbolic, "cmd2")}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded hover:bg-slate-800"
          >
            {copiedType === "cmd2" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}
