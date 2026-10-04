"use client";

import React, { useState, useMemo } from "react";
import {
  calculateTransferTime,
  calculateDataVolume,
  FileSizeUnit,
  SpeedUnit,
  TransferTimeResult,
} from "./logic";
import { Copy, Check, RotateCcw, Wifi, DownloadCloud, Activity, HardDrive } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SPEED_PRESETS = [
  { name: "3G Mobile", speed: 3, unit: "Mbps" as SpeedUnit },
  { name: "4G LTE", speed: 35, unit: "Mbps" as SpeedUnit },
  { name: "5G Ultra", speed: 300, unit: "Mbps" as SpeedUnit },
  { name: "Standard Broadband", speed: 50, unit: "Mbps" as SpeedUnit },
  { name: "Fast Cable (300 Mbps)", speed: 300, unit: "Mbps" as SpeedUnit },
  { name: "Gigabit Fiber", speed: 1000, unit: "Mbps" as SpeedUnit },
];

const FILE_PRESETS = [
  { name: "Photo Backup (5 GB)", size: 5, unit: "GB" as FileSizeUnit },
  { name: "4K UHD Movie (25 GB)", size: 25, unit: "GB" as FileSizeUnit },
  { name: "AAA Video Game (80 GB)", size: 80, unit: "GB" as FileSizeUnit },
  { name: "Cloud Server Image (500 GB)", size: 500, unit: "GB" as FileSizeUnit },
];

export default function BandwidthCalculatorTool() {
  const [fileSize, setFileSize] = useState<number>(25);
  const [fileUnit, setFileUnit] = useState<FileSizeUnit>("GB");
  const [speed, setSpeed] = useState<number>(100);
  const [speedUnit, setSpeedUnit] = useState<SpeedUnit>("Mbps");
  const [overhead, setOverhead] = useState<number>(5); // 5% TCP/IP packet overhead
  const [streamHours, setStreamHours] = useState<number>(2);
  const [copied, setCopied] = useState<boolean>(false);

  const transferResult = useMemo<TransferTimeResult>(() => {
    return calculateTransferTime(fileSize, fileUnit, speed, speedUnit, overhead);
  }, [fileSize, fileUnit, speed, speedUnit, overhead]);

  const volumeResult = useMemo(() => {
    return calculateDataVolume(speed, speedUnit, streamHours);
  }, [speed, speedUnit, streamHours]);

  const comparisonTable = useMemo(() => {
    return SPEED_PRESETS.map((preset) => {
      const res = calculateTransferTime(fileSize, fileUnit, preset.speed, preset.unit, overhead);
      return {
        name: preset.name,
        speedStr: `${preset.speed} ${preset.unit}`,
        duration: res.formatted,
        totalSeconds: res.totalSeconds,
      };
    });
  }, [fileSize, fileUnit, overhead]);

  const handleCopy = () => {
    const text = [
      `Bandwidth Transfer Estimation`,
      `File Size: ${fileSize} ${fileUnit}`,
      `Internet Speed: ${speed} ${speedUnit} (Overhead: ${overhead}%)`,
      `Estimated Transfer Duration: ${transferResult.formatted} (${transferResult.totalSeconds} seconds)`,
      "\nSpeed Comparison:",
      ...comparisonTable.map((c) => `  ${c.name} (${c.speedStr}): ${c.duration}`),
    ].join("\n");

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Presets Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
            Presets:
          </span>
          {FILE_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => {
                setFileSize(p.size);
                setFileUnit(p.unit);
              }}
              className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-slate-700 hover:text-blue-700 transition"
            >
              {p.name}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setFileSize(25);
            setFileUnit("GB");
            setSpeed(100);
            setSpeedUnit("Mbps");
            setOverhead(5);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-600 hover:text-red-600 rounded-lg border border-slate-200 hover:border-red-200 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Defaults
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Controls */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <DownloadCloud className="w-4 h-4 text-blue-600" />
            File Size & Connection
          </h2>

          {/* File Size */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              File or Download Size
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0.1"
                step="1"
                value={fileSize}
                onChange={(e) => setFileSize(Math.max(0, Number(e.target.value)))}
                className="flex-1 px-3 py-2 text-sm font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
              <Select
                value={fileUnit}
                onValueChange={(val) => setFileUnit(val as FileSizeUnit)}
              >
                <SelectTrigger className="w-24 h-9.5 text-xs font-bold bg-white border-slate-300">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MB">MB</SelectItem>
                  <SelectItem value="GB">GB</SelectItem>
                  <SelectItem value="TB">TB</SelectItem>
                  <SelectItem value="KB">KB</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Internet Speed */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Network Download / Upload Speed
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0.1"
                step="5"
                value={speed}
                onChange={(e) => setSpeed(Math.max(0, Number(e.target.value)))}
                className="flex-1 px-3 py-2 text-sm font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
              <Select
                value={speedUnit}
                onValueChange={(val) => setSpeedUnit(val as SpeedUnit)}
              >
                <SelectTrigger className="w-24 h-9.5 text-xs font-bold bg-white border-slate-300">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mbps">Mbps</SelectItem>
                  <SelectItem value="Gbps">Gbps</SelectItem>
                  <SelectItem value="MB/s">MB/s</SelectItem>
                  <SelectItem value="Kbps">Kbps</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Network Protocol Overhead */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">
                TCP/IP Packet Overhead (%)
              </label>
              <span className="text-xs font-bold text-blue-600 font-mono">
                {overhead}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={overhead}
              onChange={(e) => setOverhead(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Standard real-world TCP/IP networks have 5-10% packet overhead and latency.
            </p>
          </div>

          {/* Copy Action */}
          <div className="pt-2">
            <button
              onClick={handleCopy}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied Estimation!" : "Copy Estimation"}
            </button>
          </div>
        </div>

        {/* Right: Results Display */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Hero Card */}
          <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-blue-200/80 rounded-2xl p-6 shadow-xs text-center space-y-2">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
              Estimated Transfer Duration
            </span>
            <div className="text-4xl font-black text-slate-900 py-1 font-mono tracking-tight">
              {transferResult.formatted}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              {fileSize} {fileUnit} over {speed} {speedUnit} ({transferResult.totalSeconds} total seconds)
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Days</div>
              <div className="text-xl font-bold text-slate-900 mt-1">{transferResult.days}</div>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Hours</div>
              <div className="text-xl font-bold text-slate-900 mt-1">{transferResult.hours}</div>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Minutes</div>
              <div className="text-xl font-bold text-slate-900 mt-1">{transferResult.minutes}</div>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Seconds</div>
              <div className="text-xl font-bold text-blue-600 mt-1">{transferResult.seconds}</div>
            </div>
          </div>

          {/* Speed Comparison Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-600" />
              Transfer Time across Connection Types ({fileSize} {fileUnit})
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              {comparisonTable.map((row, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{row.name}</span>
                    <span className="text-[11px] text-slate-400">({row.speedStr})</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">{row.duration}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Data Volume Estimator Box */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-emerald-600" />
              Continuous Transfer Volume ({speed} {speedUnit})
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-600 font-medium">Transferring for:</span>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={streamHours}
                onChange={(e) => setStreamHours(Math.max(0.1, Number(e.target.value)))}
                className="w-20 px-2 py-1 text-xs font-bold rounded-lg border border-slate-300 text-center"
              />
              <span className="text-xs text-slate-600 font-medium">hours consumes:</span>
              <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                {volumeResult.gigabytes} GB ({volumeResult.terabytes} TB)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
