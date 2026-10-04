"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  ChartType,
  DataPoint,
  CHART_PALETTES,
  DEFAULT_CHART_DATA,
  parseCsvToDataPoints,
  calculateAxisBounds,
  calculatePieAngles,
} from "./logic";
import {
  BarChart3,
  LineChart,
  PieChart,
  Download,
  RotateCcw,
  ShieldCheck,
  Plus,
  Trash2,
  FileSpreadsheet,
} from "lucide-react";

export default function ChartGraphVisualizerTool() {
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [title, setTitle] = useState<string>("Monthly Active User Growth");
  const [subtitle, setSubtitle] = useState<string>("Q1 - Q2 Performance Metrics (Local Analytics)");
  const [dataPoints, setDataPoints] = useState<DataPoint[]>(DEFAULT_CHART_DATA);
  const [csvInput, setCsvInput] = useState<string>(
    DEFAULT_CHART_DATA.map((d) => `${d.label}, ${d.value}`).join("\n")
  );
  const [paletteIndex, setPaletteIndex] = useState<number>(0);
  const [showValues, setShowValues] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const renderChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 1200;
    const height = 750;
    canvas.width = width;
    canvas.height = height;

    const palette = CHART_PALETTES[paletteIndex] ?? CHART_PALETTES[0]!;
    const colors = palette.colors;
    const primaryColor = colors[0] ?? "#6366f1";

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Title & Subtitle
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 32px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(title, 80, 70);

    if (subtitle) {
      ctx.fillStyle = "#64748b";
      ctx.font = "normal 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(subtitle, 80, 100);
    }

    // Chart Area
    const chartLeft = 100;
    const chartTop = 150;
    const chartWidth = width - 180;
    const chartHeight = height - 250;
    const chartBottom = chartTop + chartHeight;

    if (chartType === "pie") {
      // Draw Pie Chart
      const centerX = width / 2 - 80;
      const centerY = chartTop + chartHeight / 2;
      const radius = Math.min(chartWidth, chartHeight) / 2 - 30;

      const slices = calculatePieAngles(dataPoints);

      slices.forEach((slice, idx) => {
        const color = colors[idx % colors.length] ?? "#6366f1";
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, slice.startAngle, slice.endAngle);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Slice label
        if (showValues && slice.percent > 4) {
          const midAngle = slice.startAngle + (slice.endAngle - slice.startAngle) / 2;
          const labelDist = radius * 0.7;
          const lx = centerX + Math.cos(midAngle) * labelDist;
          const ly = centerY + Math.sin(midAngle) * labelDist;

          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(`${slice.percent}%`, lx, ly);
        }
      });

      // Legend on right
      let legY = chartTop + 40;
      const legX = width - 300;
      slices.forEach((slice, idx) => {
        const color = colors[idx % colors.length] ?? "#6366f1";
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(legX, legY, 16, 16, 4);
        ctx.fill();

        ctx.fillStyle = "#334155";
        ctx.font = "500 14px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(`${slice.label} (${slice.value})`, legX + 26, legY + 13);
        legY += 28;
      });

      return;
    }

    // Bar & Line Charts
    const bounds = calculateAxisBounds(dataPoints);

    // Gridlines
    if (showGrid) {
      const gridSteps = 5;
      ctx.strokeStyle = "#f1f5f9";
      ctx.lineWidth = 1.5;
      ctx.fillStyle = "#94a3b8";
      ctx.font = "12px monospace";
      ctx.textAlign = "right";

      for (let i = 0; i <= gridSteps; i++) {
        const y = chartBottom - (i / gridSteps) * chartHeight;
        const val = Math.round((i / gridSteps) * bounds.niceMax);

        ctx.beginPath();
        ctx.moveTo(chartLeft, y);
        ctx.lineTo(chartLeft + chartWidth, y);
        ctx.stroke();

        ctx.fillText(val.toString(), chartLeft - 14, y + 4);
      }
    }

    const count = dataPoints.length;
    if (count === 0) return;

    if (chartType === "bar") {
      const slotWidth = chartWidth / count;
      const barWidth = Math.min(64, slotWidth * 0.65);

      dataPoints.forEach((d, idx) => {
        const barHeight = (d.value / bounds.niceMax) * chartHeight;
        const x = chartLeft + idx * slotWidth + (slotWidth - barWidth) / 2;
        const y = chartBottom - barHeight;
        const color = colors[idx % colors.length] ?? "#6366f1";

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [6, 6, 0, 0]);
        ctx.fill();

        // Label below
        ctx.fillStyle = "#475569";
        ctx.font = "600 13px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(d.label, x + barWidth / 2, chartBottom + 26);

        // Value above
        if (showValues) {
          ctx.fillStyle = "#0f172a";
          ctx.font = "bold 12px monospace";
          ctx.fillText(d.value.toString(), x + barWidth / 2, y - 8);
        }
      });
    } else if (chartType === "line") {
      const slotWidth = chartWidth / (count - 1 || 1);
      const points = dataPoints.map((d, idx) => ({
        x: chartLeft + idx * slotWidth,
        y: chartBottom - (d.value / bounds.niceMax) * chartHeight,
        label: d.label,
        value: d.value,
      }));

      const firstPoint = points[0];
      const lastPoint = points[points.length - 1];
      if (!firstPoint || !lastPoint) return;

      // Line gradient fill
      const areaGrad = ctx.createLinearGradient(0, chartTop, 0, chartBottom);
      areaGrad.addColorStop(0, `${primaryColor}44`);
      areaGrad.addColorStop(1, `${primaryColor}05`);

      ctx.beginPath();
      ctx.moveTo(firstPoint.x, chartBottom);
      points.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.lineTo(lastPoint.x, chartBottom);
      ctx.closePath();
      ctx.fillStyle = areaGrad;
      ctx.fill();

      // Line stroke
      ctx.beginPath();
      ctx.moveTo(firstPoint.x, firstPoint.y);
      points.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 4;
      ctx.stroke();

      // Nodes
      points.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = "#475569";
        ctx.font = "600 13px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(p.label, p.x, chartBottom + 26);

        if (showValues) {
          ctx.fillStyle = "#0f172a";
          ctx.font = "bold 12px monospace";
          ctx.fillText(p.value.toString(), p.x, p.y - 12);
        }
      });
    }
  }, [chartType, title, subtitle, dataPoints, paletteIndex, showValues, showGrid]);

  useEffect(() => {
    renderChart();
  }, [renderChart]);

  const handleApplyCsv = () => {
    const parsed = parseCsvToDataPoints(csvInput);
    if (parsed.length > 0) {
      setDataPoints(parsed);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `chart-${chartType}-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-20 lg:pb-0">
      {/* Privacy Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="leading-relaxed">Chart & Graph Visualizer — Pure HTML Canvas. Paste CSV or enter metrics securely in browser memory.</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setDataPoints(DEFAULT_CHART_DATA);
              setCsvInput(DEFAULT_CHART_DATA.map((d) => `${d.label}, ${d.value}`).join("\n"));
            }}
            className="h-7 text-xs gap-1 border-emerald-300 dark:border-emerald-700"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </Button>
          <Button
            size="sm"
            onClick={handleDownload}
            className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Download className="w-3 h-3" /> Export Chart PNG
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Canvas Retina Master */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center p-6 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="w-full aspect-[16/10] bg-white rounded-xl shadow-xl overflow-hidden flex items-center justify-center">
            <canvas ref={canvasRef} className="w-full h-full object-contain" />
          </div>
          <p className="text-xs text-slate-500 mt-3 font-mono">
            Render Resolution: 1200 x 750 px (Retina 2x Export)
          </p>
        </div>

        {/* Right: Customization Controls */}
        <div className="lg:col-span-4 space-y-5">
          {/* Chart Type */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 shadow-sm">
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Chart Type
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setChartType("bar")}
                className={`p-2 rounded-lg border text-xs font-medium flex flex-col items-center gap-1.5 transition-colors ${
                  chartType === "bar"
                    ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                <BarChart3 className="w-4 h-4" /> Bar
              </button>
              <button
                type="button"
                onClick={() => setChartType("line")}
                className={`p-2 rounded-lg border text-xs font-medium flex flex-col items-center gap-1.5 transition-colors ${
                  chartType === "line"
                    ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                <LineChart className="w-4 h-4" /> Line
              </button>
              <button
                type="button"
                onClick={() => setChartType("pie")}
                className={`p-2 rounded-lg border text-xs font-medium flex flex-col items-center gap-1.5 transition-colors ${
                  chartType === "pie"
                    ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                <PieChart className="w-4 h-4" /> Pie
              </button>
            </div>
          </div>

          {/* Titles & Toggles */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 shadow-sm">
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Headings & Options
            </h4>
            <input
              type="text"
              placeholder="Chart Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-semibold border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
            />
            <input
              type="text"
              placeholder="Subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
            />

            <div className="flex gap-4 pt-1 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showValues}
                  onChange={(e) => setShowValues(e.target.checked)}
                  className="rounded"
                />
                <span>Values</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="rounded"
                />
                <span>Grid Lines</span>
              </label>
            </div>
          </div>

          {/* CSV Input */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Data Points (CSV)
              </h4>
              <button
                type="button"
                onClick={handleApplyCsv}
                className="text-xs text-emerald-600 font-semibold hover:underline"
              >
                Apply Data
              </button>
            </div>
            <textarea
              rows={6}
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              placeholder="Label, Value&#10;Jan, 420&#10;Feb, 680"
              className="w-full px-2.5 py-1.5 text-xs font-mono border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
            />
            <p className="text-[10px] text-slate-400">
              Format: Label, Value (one per row). Tap &quot;Apply Data&quot; to update canvas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
