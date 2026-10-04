"use client";

import React, { useState, useMemo } from "react";
import {
  calculateHeartRateZones,
  HeartRateInput,
  MhrFormula,
  Gender,
} from "./logic";
import {
  Copy,
  Check,
  Download,
  Heart,
  Activity,
  Flame,
  Zap,
  Gauge,
  ShieldAlert,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Preset {
  name: string;
  age: number;
  restingHeartRate: number;
  gender: Gender;
  formula: MhrFormula;
}

const PRESETS: Preset[] = [
  {
    name: "Endurance Athlete",
    age: 26,
    restingHeartRate: 50,
    gender: "male",
    formula: "karvonen",
  },
  {
    name: "General Fitness",
    age: 32,
    restingHeartRate: 65,
    gender: "male",
    formula: "karvonen",
  },
  {
    name: "Active 40s",
    age: 44,
    restingHeartRate: 68,
    gender: "female",
    formula: "tanaka",
  },
  {
    name: "Senior Wellness",
    age: 65,
    restingHeartRate: 72,
    gender: "female",
    formula: "tanaka",
  },
];

const DEFAULT_ZONE_STYLE = { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-700", badge: "bg-slate-200 text-slate-800" };

const ZONE_COLORS: Record<number, { bg: string; border: string; text: string; badge: string }> = {
  1: DEFAULT_ZONE_STYLE,
  2: { bg: "bg-blue-50/60", border: "border-blue-200", text: "text-blue-700", badge: "bg-blue-200 text-blue-800" },
  3: { bg: "bg-emerald-50/60", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-200 text-emerald-800" },
  4: { bg: "bg-amber-50/60", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-200 text-amber-800" },
  5: { bg: "bg-rose-50/60", border: "border-rose-200", text: "text-rose-700", badge: "bg-rose-200 text-rose-800" },
};

export default function TargetHeartRateCalculatorTool() {
  const [age, setAge] = useState<number>(30);
  const [rhr, setRhr] = useState<number>(65);
  const [gender, setGender] = useState<Gender>("male");
  const [formula, setFormula] = useState<MhrFormula>("karvonen");
  const [copied, setCopied] = useState<boolean>(false);

  const input: HeartRateInput = useMemo(
    () => ({
      age,
      restingHeartRate: rhr,
      gender,
      formula,
    }),
    [age, rhr, gender, formula]
  );

  const result = useMemo(() => {
    try {
      return calculateHeartRateZones(input);
    } catch {
      return null;
    }
  }, [input]);

  const handleApplyPreset = (p: Preset) => {
    setAge(p.age);
    setRhr(p.restingHeartRate);
    setGender(p.gender);
    setFormula(p.formula);
  };

  const handleCopy = () => {
    if (!result) return;
    const summary = [
      "Target Heart Rate Training Zones",
      `Age: ${age} | Resting HR: ${rhr} bpm | Max HR: ${result.maxHeartRate} bpm`,
      `Formula: ${formula.toUpperCase()}`,
      "",
      ...result.zones.map(
        (z) =>
          `Zone ${z.zone} (${z.name}): ${z.minBpm} - ${z.maxBpm} bpm (${z.minPercent}%-${z.maxPercent}%)`
      ),
    ].join("\n");

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    if (!result) return;
    const rows = [
      "Zone,Name,Min BPM,Max BPM,Intensity %,Description",
      ...result.zones.map(
        (z) =>
          `Zone ${z.zone},"${z.name}",${z.minBpm},${z.maxBpm},"${z.minPercent}%-${z.maxPercent}%","${z.benefits}"`
      ),
    ];

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `heart_rate_zones_age_${age}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Presets Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
            Presets:
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => handleApplyPreset(p)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-slate-700 hover:text-blue-700 transition"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Form */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" />
            Cardiovascular Profile
          </h2>

          {/* Age Slider & Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">Age</label>
              <span className="text-xs font-bold text-blue-600 font-mono">{age} Years</span>
            </div>
            <input
              type="range"
              min="10"
              max="95"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full accent-blue-600 mb-2"
            />
            <input
              type="number"
              min="10"
              max="95"
              value={age}
              onChange={(e) => setAge(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          {/* Resting Heart Rate */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">Resting Heart Rate (RHR)</label>
              <span className="text-xs font-bold text-rose-600 font-mono">{rhr} BPM</span>
            </div>
            <input
              type="number"
              min="35"
              max="115"
              value={rhr}
              onChange={(e) => setRhr(Math.max(30, Number(e.target.value)))}
              className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Measured right after waking up before getting out of bed.
            </p>
          </div>

          {/* Gender & Formula */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Gender</label>
              <Select
                value={gender}
                onValueChange={(val) => setGender(val as Gender)}
              >
                <SelectTrigger className="w-full text-xs font-semibold text-slate-900 bg-white border-slate-300">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Formula Model</label>
              <Select
                value={formula}
                onValueChange={(val) => setFormula(val as MhrFormula)}
              >
                <SelectTrigger className="w-full text-xs font-semibold text-slate-900 bg-white border-slate-300">
                  <SelectValue placeholder="Formula" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="karvonen">Karvonen (HRR + RHR)</SelectItem>
                  <SelectItem value="tanaka">Tanaka (208 - 0.7*Age)</SelectItem>
                  <SelectItem value="fox">Fox (220 - Age)</SelectItem>
                  <SelectItem value="gulati">Gulati (Female validated)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Right: Zones & Cardiac Overview */}
        <div className="lg:col-span-7 space-y-5">
          {result ? (
            <>
              {/* Max Heart Rate Hero Card */}
              <div className="bg-gradient-to-br from-rose-50 via-orange-50/50 to-slate-50 border border-rose-200/80 rounded-2xl p-6 shadow-xs relative">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-rose-600" />
                    Cardiac Capacity Baseline
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
                      title="Copy Summary"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                    <button
                      onClick={handleDownloadCsv}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
                      title="Export CSV"
                    >
                      <Download className="w-3.5 h-3.5" />
                      CSV
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-baseline gap-4">
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Max Heart Rate (MHR)</div>
                    <div className="text-4xl font-black text-slate-900 font-mono tracking-tight mt-0.5">
                      {result.maxHeartRate}{" "}
                      <span className="text-base font-semibold text-slate-500">BPM</span>
                    </div>
                  </div>
                  <div className="border-l border-slate-200 pl-4">
                    <div className="text-xs text-slate-500 font-medium">Heart Rate Reserve (HRR)</div>
                    <div className="text-2xl font-bold text-rose-600 font-mono mt-0.5">
                      {result.heartRateReserve}{" "}
                      <span className="text-xs font-semibold text-slate-500">BPM</span>
                    </div>
                  </div>
                  <div className="border-l border-slate-200 pl-4">
                    <div className="text-xs text-slate-500 font-medium">Resting HR</div>
                    <div className="text-2xl font-bold text-slate-700 font-mono mt-0.5">
                      {result.restingHeartRate}{" "}
                      <span className="text-xs font-semibold text-slate-500">BPM</span>
                    </div>
                  </div>
                </div>

                {/* 5-Zone Progression Bar */}
                <div className="mt-5 space-y-1.5">
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
                    <div className="h-full bg-slate-400 w-1/5" title="Zone 1: Active Recovery" />
                    <div className="h-full bg-blue-500 w-1/5" title="Zone 2: Aerobic Base" />
                    <div className="h-full bg-emerald-500 w-1/5" title="Zone 3: Tempo" />
                    <div className="h-full bg-amber-500 w-1/5" title="Zone 4: Threshold" />
                    <div className="h-full bg-rose-500 w-1/5" title="Zone 5: VO2 Max" />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <span>Z1: 50%</span>
                    <span>Z2: 60%</span>
                    <span>Z3: 70%</span>
                    <span>Z4: 80%</span>
                    <span>Z5: 90%-100%</span>
                  </div>
                </div>
              </div>

              {/* 5 Zone Cards */}
              <div className="space-y-2.5">
                {result.zones.map((zone) => {
                  const style = ZONE_COLORS[zone.zone] ?? DEFAULT_ZONE_STYLE;
                  return (
                    <div
                      key={zone.zone}
                      className={`p-3.5 rounded-xl border ${style.border} ${style.bg} transition shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${style.badge}`}
                          >
                            Zone {zone.zone}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{zone.name}</span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            ({zone.minPercent}% – {zone.maxPercent}%)
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                          {zone.benefits}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs text-slate-500 font-medium">Target Window</div>
                        <div className="text-lg font-black font-mono text-slate-900">
                          {zone.minBpm} – {zone.maxBpm}{" "}
                          <span className="text-xs font-bold text-slate-500">BPM</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-sm text-slate-500 bg-white border border-slate-200 rounded-2xl">
              Please enter valid age and resting heart rate.
            </div>
          )}

          {/* Statutory Medical Disclaimer */}
          <div className="p-3 bg-amber-50/80 border border-amber-200/60 rounded-xl flex gap-2 items-start text-[11px] text-amber-800 leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Statutory Medical Disclaimer:</strong> Target heart rate zones are calculated using statistical age-predicted formulas. Individual cardiovascular thresholds, beta-blocker medications, and fitness levels alter heart rate responses. Consult your physician or cardiologist before starting any high-intensity exercise regimen.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
