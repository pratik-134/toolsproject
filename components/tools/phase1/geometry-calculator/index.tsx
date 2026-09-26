"use client";

import React, { useState, useMemo } from "react";
import { calculateGeometry, ShapeType, GeometryResult } from "./logic";
import { Copy, Check, RotateCcw, Shapes, Box, Circle, Square, Triangle } from "lucide-react";

interface ShapeConfig {
  id: ShapeType;
  name: string;
  category: "2D" | "3D";
  fields: { key: string; label: string; def: number; step?: number }[];
}

const SHAPES: ShapeConfig[] = [
  // 2D Shapes
  {
    id: "circle",
    name: "Circle",
    category: "2D",
    fields: [{ key: "radius", label: "Radius (r)", def: 5, step: 0.5 }],
  },
  {
    id: "rectangle",
    name: "Rectangle",
    category: "2D",
    fields: [
      { key: "width", label: "Width (w)", def: 8, step: 0.5 },
      { key: "height", label: "Height (h)", def: 5, step: 0.5 },
    ],
  },
  {
    id: "triangle",
    name: "Triangle",
    category: "2D",
    fields: [
      { key: "base", label: "Base (b)", def: 6, step: 0.5 },
      { key: "height", label: "Height (h)", def: 4, step: 0.5 },
      { key: "sideA", label: "Side A", def: 5, step: 0.5 },
      { key: "sideB", label: "Side B", def: 5, step: 0.5 },
    ],
  },
  {
    id: "trapezoid",
    name: "Trapezoid",
    category: "2D",
    fields: [
      { key: "baseA", label: "Base a", def: 10, step: 0.5 },
      { key: "baseB", label: "Base b", def: 6, step: 0.5 },
      { key: "height", label: "Height (h)", def: 4, step: 0.5 },
      { key: "leg1", label: "Leg 1", def: 5, step: 0.5 },
      { key: "leg2", label: "Leg 2", def: 5, step: 0.5 },
    ],
  },
  {
    id: "ellipse",
    name: "Ellipse",
    category: "2D",
    fields: [
      { key: "semiMajorA", label: "Semi-major axis (a)", def: 6, step: 0.5 },
      { key: "semiMinorB", label: "Semi-minor axis (b)", def: 4, step: 0.5 },
    ],
  },
  {
    id: "regular-polygon",
    name: "Regular Polygon",
    category: "2D",
    fields: [
      { key: "sides", label: "Number of Sides (n)", def: 6, step: 1 },
      { key: "sideLength", label: "Side Length (s)", def: 4, step: 0.5 },
    ],
  },
  // 3D Shapes
  {
    id: "sphere",
    name: "Sphere",
    category: "3D",
    fields: [{ key: "radius", label: "Radius (r)", def: 5, step: 0.5 }],
  },
  {
    id: "cylinder",
    name: "Cylinder",
    category: "3D",
    fields: [
      { key: "radius", label: "Radius (r)", def: 4, step: 0.5 },
      { key: "height", label: "Height (h)", def: 8, step: 0.5 },
    ],
  },
  {
    id: "cone",
    name: "Cone",
    category: "3D",
    fields: [
      { key: "radius", label: "Radius (r)", def: 3, step: 0.5 },
      { key: "height", label: "Height (h)", def: 6, step: 0.5 },
    ],
  },
  {
    id: "rectangular-prism",
    name: "Rectangular Prism (Box)",
    category: "3D",
    fields: [
      { key: "length", label: "Length (l)", def: 6, step: 0.5 },
      { key: "width", label: "Width (w)", def: 4, step: 0.5 },
      { key: "height", label: "Height (h)", def: 5, step: 0.5 },
    ],
  },
  {
    id: "pyramid",
    name: "Square Pyramid",
    category: "3D",
    fields: [
      { key: "baseSide", label: "Base Side (s)", def: 6, step: 0.5 },
      { key: "height", label: "Height (h)", def: 8, step: 0.5 },
    ],
  },
];

export default function GeometryCalculatorTool() {
  const [categoryFilter, setCategoryFilter] = useState<"2D" | "3D">("2D");
  const [selectedShapeId, setSelectedShapeId] = useState<ShapeType>("circle");
  const [params, setParams] = useState<Record<string, number>>({
    radius: 5,
    width: 8,
    height: 5,
    base: 6,
    sideA: 5,
    sideB: 5,
    baseA: 10,
    baseB: 6,
    leg1: 5,
    leg2: 5,
    semiMajorA: 6,
    semiMinorB: 4,
    sides: 6,
    sideLength: 4,
    length: 6,
    baseSide: 6,
  });
  const [copied, setCopied] = useState<boolean>(false);

  const activeShape = useMemo(
    () => SHAPES.find((s) => s.id === selectedShapeId) ?? SHAPES[0]!,
    [selectedShapeId]
  );

  const result = useMemo<GeometryResult>(() => {
    return calculateGeometry(selectedShapeId, params);
  }, [selectedShapeId, params]);

  const handleParamChange = (key: string, val: number) => {
    setParams((prev) => ({ ...prev, [key]: val }));
  };

  const handleCopy = () => {
    const text = [
      `Geometry Calculation: ${result.title} (${result.category})`,
      "Dimensions:",
      ...activeShape.fields.map((f) => `  ${f.label}: ${params[f.key] ?? f.def}`),
      "Results:",
      ...result.metrics.map((m) => `  ${m.label}: ${m.value} ${m.unit} [Formula: ${m.formula}]`),
    ].join("\n");

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 2D / 3D Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => {
              setCategoryFilter("2D");
              setSelectedShapeId("circle");
            }}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              categoryFilter === "2D"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            2D Plane Shapes
          </button>
          <button
            onClick={() => {
              setCategoryFilter("3D");
              setSelectedShapeId("sphere");
            }}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              categoryFilter === "3D"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            3D Solid Shapes
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-400 mr-1">Examples:</span>
          <button
            onClick={() => {
              setCategoryFilter("2D");
              setSelectedShapeId("circle");
              handleParamChange("radius", 1);
            }}
            className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 text-slate-700 transition"
          >
            Unit Circle
          </button>
          <button
            onClick={() => {
              setCategoryFilter("2D");
              setSelectedShapeId("rectangle");
              handleParamChange("width", 29.7);
              handleParamChange("height", 21);
            }}
            className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 text-slate-700 transition"
          >
            A4 Paper (cm)
          </button>
          <button
            onClick={() => {
              setCategoryFilter("3D");
              setSelectedShapeId("cylinder");
              handleParamChange("radius", 3.3);
              handleParamChange("height", 12.2);
            }}
            className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 text-slate-700 transition"
          >
            Soda Can (cm)
          </button>
        </div>
      </div>

      {/* Shape Selector Ribbon */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {SHAPES.filter((s) => s.category === categoryFilter).map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedShapeId(s.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition ${
              selectedShapeId === s.id
                ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Dimension Inputs */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {activeShape.name} Dimensions
            </h2>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {activeShape.category}
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {activeShape.fields.map((f) => {
              const val = params[f.key] ?? f.def;
              return (
                <div key={f.key}>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      {f.label}
                    </label>
                    <span className="text-xs font-bold text-blue-600 font-mono">
                      {val}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0.1"
                    step={f.step ?? 0.5}
                    value={val}
                    onChange={(e) => handleParamChange(f.key, Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900"
                  />
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={handleCopy}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied Metrics!" : "Copy Metrics"}
            </button>
            <button
              onClick={() => {
                activeShape.fields.forEach((f) => handleParamChange(f.key, f.def));
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>

        {/* Right: Results Display */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Hero Card */}
          <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-blue-200/80 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                {result.title} Summary
              </span>
              <span className="text-xs text-slate-500 font-medium">Standard SI / Imperial</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {result.metrics.map((m, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-1"
                >
                  <div className="text-xs text-slate-500 font-medium">{m.label}</div>
                  <div className="text-2xl font-black text-blue-600">
                    {m.value}{" "}
                    <span className="text-xs font-normal text-slate-500">{m.unit}</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 inline-block">
                    {m.formula}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Formulas and Explanations Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Mathematical Formulas
            </h3>
            <div className="space-y-2">
              {result.metrics.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-semibold text-slate-800">{m.label}:</span>
                    <span className="text-xs text-slate-500 ml-2">Result in {m.unit}</span>
                  </div>
                  <code className="text-xs font-bold text-blue-700 font-mono bg-white px-2.5 py-1 rounded-md border border-slate-200">
                    {m.formula}
                  </code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
