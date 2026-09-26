"use client";

import React, { useState, useId } from "react";
import { Network, Copy, Check, Server, Globe, Cpu } from "lucide-react";
import { calculateSubnet } from "./logic";

const COMMON_CIDRS = [
  { cidr: 8, label: "/8 (Class A / 16.7M Hosts)" },
  { cidr: 16, label: "/16 (Class B / 65K Hosts)" },
  { cidr: 24, label: "/24 (Class C / 254 Hosts)" },
  { cidr: 28, label: "/28 (Small Office / 14 Hosts)" },
  { cidr: 30, label: "/30 (Point-to-Point / 2 Hosts)" },
  { cidr: 32, label: "/32 (Single Host)" },
];

export default function IpSubnetCalculator() {
  const ipAddressInputId = useId();
  const cidrPrefixSelectId = useId();
  const cidrRangeSliderId = useId();
  const [ipInput, setIpInput] = useState("192.168.1.100");
  const [cidr, setCidr] = useState(24);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  let result = null;
  let errorMsg = null;
  try {
    result = calculateSubnet(ipInput, cidr);
  } catch (err: any) {
    errorMsg = err.message;
  }

  const copyVal = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Input Form Panel */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* IP Input */}
          <div>
            <label htmlFor={ipAddressInputId} className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
              IPv4 Address
            </label>
            <input
              id={ipAddressInputId}
              type="text"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              placeholder="e.g. 192.168.1.1"
              className="w-full px-3 py-2 font-mono text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* CIDR Prefix */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor={cidrPrefixSelectId} className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Subnet Mask / Prefix (/{cidr})
              </label>
              <select
                id={cidrPrefixSelectId}
                value={cidr}
                onChange={(e) => setCidr(Number(e.target.value))}
                className="px-2 py-0.5 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                {Array.from({ length: 33 }, (_, i) => (
                  <option key={i} value={i}>
                    /{i} ({Math.pow(2, 32 - i).toLocaleString()} addresses)
                  </option>
                ))}
              </select>
            </div>
            <input
              id={cidrRangeSliderId}
              type="range"
              min={0}
              max={32}
              value={cidr}
              onChange={(e) => setCidr(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
              <span>/0</span>
              <span>/8</span>
              <span>/16</span>
              <span>/24</span>
              <span>/32</span>
            </div>
          </div>
        </div>

        {/* Common CIDR presets */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500 uppercase mr-1">Presets:</span>
          {COMMON_CIDRS.map((c) => (
            <button
              key={c.cidr}
              onClick={() => setCidr(c.cidr)}
              className={`px-2.5 py-1 text-xs rounded-lg border font-mono transition-colors ${
                cidr === c.cidr
                  ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600 text-sm border border-red-200 dark:border-red-900 font-mono">
          {errorMsg}
        </div>
      )}

      {/* Main Results Grid */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Network & Host Range Card */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm">
              <Network className="w-4 h-4 text-blue-500" /> Network Addressing
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-500">Network Address:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{result.networkAddress}</span>
                  <button onClick={() => copyVal(result.networkAddress, "net")} className="text-slate-400 hover:text-slate-600">
                    {copiedKey === "net" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-500">Broadcast Address:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{result.broadcastAddress}</span>
                  <button onClick={() => copyVal(result.broadcastAddress, "bcast")} className="text-slate-400 hover:text-slate-600">
                    {copiedKey === "bcast" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-500">First Usable Host:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{result.firstUsableIp}</span>
                  <button onClick={() => copyVal(result.firstUsableIp, "first")} className="text-slate-400 hover:text-slate-600">
                    {copiedKey === "first" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-500">Last Usable Host:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{result.lastUsableIp}</span>
                  <button onClick={() => copyVal(result.lastUsableIp, "last")} className="text-slate-400 hover:text-slate-600">
                    {copiedKey === "last" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Subnet Masks & Host Capacities */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm">
              <Server className="w-4 h-4 text-emerald-500" /> Mask & Host Capacity
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-500">Subnet Mask:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{result.subnetMask}</span>
                  <button onClick={() => copyVal(result.subnetMask, "mask")} className="text-slate-400 hover:text-slate-600">
                    {copiedKey === "mask" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-500">Wildcard Mask:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-purple-600 dark:text-purple-400">{result.wildcardMask}</span>
                  <button onClick={() => copyVal(result.wildcardMask, "wild")} className="text-slate-400 hover:text-slate-600">
                    {copiedKey === "wild" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-500">Usable Hosts:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                  {result.usableHosts.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-500">Total Host Addresses:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {result.totalHosts.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Classification & Binary Breakdown */}
      {result && (
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-blue-500" />
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">IP Class</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{result.ipClass}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Cpu className="w-5 h-5 text-emerald-500" />
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">Network Scope</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{result.scope}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2 rounded bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-500">IP (Binary):</span>
              <span className="text-slate-800 dark:text-slate-200 tracking-wider">{result.binaryIp}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2 rounded bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-500">Subnet Mask (Binary):</span>
              <span className="text-blue-600 dark:text-blue-400 tracking-wider">{result.binaryMask}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
