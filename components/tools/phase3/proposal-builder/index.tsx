"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ProposalData,
  ProposalPricingItem,
  ProposalMilestone,
  DEFAULT_PROPOSAL,
  calculateProposalTotal,
} from "./logic";
import { formatCurrency } from "../invoice-generator/logic";
import {
  FileSpreadsheet,
  Printer,
  RotateCcw,
  Plus,
  Trash2,
  ShieldCheck,
  Building,
  Target,
  Clock,
  DollarSign,
} from "lucide-react";

const STORAGE_KEY = "ct_proposal_draft";

export default function ProposalBuilderTool() {
  const [data, setData] = useState<ProposalData>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return DEFAULT_PROPOSAL;
  });

  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // guard
    }
  }, [data]);

  const total = calculateProposalTotal(data.pricing);

  const handleAddPricing = () => {
    const newItem: ProposalPricingItem = {
      id: `p-${Date.now()}`,
      item: "Technical Milestone Deliverable",
      description: "Detailed service scope and deliverables.",
      qty: 1,
      rate: 1500,
    };
    setData((prev) => ({ ...prev, pricing: [...prev.pricing, newItem] }));
  };

  const handleAddMilestone = () => {
    const newM: ProposalMilestone = {
      id: `m-${Date.now()}`,
      phase: `Phase ${data.milestones.length + 1}: Expansion`,
      duration: "Weeks 9 - 10",
      deliverables: "Extended integrations, testing, and training.",
    };
    setData((prev) => ({ ...prev, milestones: [...prev.milestones, newM] }));
  };

  const handleReset = () => {
    if (window.confirm("Reset proposal draft to default values?")) {
      setData(DEFAULT_PROPOSAL);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Privacy Banner */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Professional Proposal Builder — Stored 100% locally on your device.</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            className="h-7 text-xs gap-1 border-emerald-300 dark:border-emerald-700"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </Button>
          <Button
            size="sm"
            onClick={() => window.print()}
            className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Printer className="w-3 h-3" /> Print / Save PDF
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "edit"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Proposal Outline & Pricing
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "preview"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Complete Proposal Preview
          </button>
        </div>
      </div>

      {activeTab === "edit" ? (
        <div className="space-y-6">
          {/* Cover & Parties */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Cover & Metadata
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Proposal Title
                </label>
                <input
                  type="text"
                  value={data.proposalTitle}
                  onChange={(e) => setData((prev) => ({ ...prev, proposalTitle: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs font-semibold border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={data.proposalSubtitle}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, proposalSubtitle: e.target.value }))
                  }
                  className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-2 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Prepared For (Client)
                </span>
                <input
                  type="text"
                  placeholder="Client Name"
                  value={data.preparedFor.clientName}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      preparedFor: { ...prev.preparedFor, clientName: e.target.value },
                    }))
                  }
                  className="w-full px-2.5 py-1 text-xs border rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                />
                <input
                  type="text"
                  placeholder="Client Company"
                  value={data.preparedFor.clientCompany}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      preparedFor: { ...prev.preparedFor, clientCompany: e.target.value },
                    }))
                  }
                  className="w-full px-2.5 py-1 text-xs border rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-2 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Prepared By (Provider)
                </span>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={data.preparedBy.authorName}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      preparedBy: { ...prev.preparedBy, authorName: e.target.value },
                    }))
                  }
                  className="w-full px-2.5 py-1 text-xs border rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                />
                <input
                  type="text"
                  placeholder="Agency / Organization"
                  value={data.preparedBy.agencyCompany}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      preparedBy: { ...prev.preparedBy, agencyCompany: e.target.value },
                    }))
                  }
                  className="w-full px-2.5 py-1 text-xs border rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Narrative Sections */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Target className="w-4 h-4 text-emerald-600" /> Executive Narrative & Solution
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Executive Summary
              </label>
              <textarea
                rows={3}
                value={data.executiveSummary}
                onChange={(e) => setData((prev) => ({ ...prev, executiveSummary: e.target.value }))}
                className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Problem Statement
                </label>
                <textarea
                  rows={3}
                  value={data.problemStatement}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, problemStatement: e.target.value }))
                  }
                  className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 leading-relaxed"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Proposed Solution & Benefits
                </label>
                <textarea
                  rows={3}
                  value={data.proposedSolution}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, proposedSolution: e.target.value }))
                  }
                  className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Timeline & Milestones */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" /> Milestones & Timeline
              </h3>
              <Button
                size="sm"
                onClick={handleAddMilestone}
                className="h-7 text-xs gap-1 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900"
              >
                <Plus className="w-3.5 h-3.5" /> Add Milestone
              </Button>
            </div>

            <div className="space-y-3">
              {data.milestones.map((m) => (
                <div
                  key={m.id}
                  className="grid grid-cols-12 gap-2 items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className="col-span-12 sm:col-span-3">
                    <input
                      type="text"
                      value={m.phase}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          milestones: prev.milestones.map((it) =>
                            it.id === m.id ? { ...it, phase: e.target.value } : it
                          ),
                        }))
                      }
                      className="w-full px-2.5 py-1 text-xs font-semibold border rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-3">
                    <input
                      type="text"
                      value={m.duration}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          milestones: prev.milestones.map((it) =>
                            it.id === m.id ? { ...it, duration: e.target.value } : it
                          ),
                        }))
                      }
                      className="w-full px-2.5 py-1 text-xs border rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div className="col-span-11 sm:col-span-5">
                    <input
                      type="text"
                      value={m.deliverables}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          milestones: prev.milestones.map((it) =>
                            it.id === m.id ? { ...it, deliverables: e.target.value } : it
                          ),
                        }))
                      }
                      className="w-full px-2.5 py-1 text-xs border rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        setData((prev) => ({
                          ...prev,
                          milestones: prev.milestones.filter((it) => it.id !== m.id),
                        }))
                      }
                      disabled={data.milestones.length <= 1}
                      className="text-slate-400 hover:text-rose-600 disabled:opacity-30 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Table */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" /> Commercials & Pricing
              </h3>
              <Button
                size="sm"
                onClick={handleAddPricing}
                className="h-7 text-xs gap-1 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900"
              >
                <Plus className="w-3.5 h-3.5" /> Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {data.pricing.map((p) => (
                <div
                  key={p.id}
                  className="grid grid-cols-12 gap-2 items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className="col-span-12 sm:col-span-4">
                    <input
                      type="text"
                      placeholder="Item title"
                      value={p.item}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          pricing: prev.pricing.map((it) =>
                            it.id === p.id ? { ...it, item: e.target.value } : it
                          ),
                        }))
                      }
                      className="w-full px-2.5 py-1 text-xs font-semibold border rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-4">
                    <input
                      type="text"
                      placeholder="Scope details"
                      value={p.description}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          pricing: prev.pricing.map((it) =>
                            it.id === p.id ? { ...it, description: e.target.value } : it
                          ),
                        }))
                      }
                      className="w-full px-2.5 py-1 text-xs border rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-500"
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-1">
                    <input
                      type="number"
                      min="1"
                      value={p.qty}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          pricing: prev.pricing.map((it) =>
                            it.id === p.id
                              ? { ...it, qty: Math.max(1, Number(e.target.value) || 1) }
                              : it
                          ),
                        }))
                      }
                      className="w-full px-2 py-1 text-xs border rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-center"
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <input
                      type="number"
                      min="0"
                      value={p.rate}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          pricing: prev.pricing.map((it) =>
                            it.id === p.id
                              ? { ...it, rate: Math.max(0, Number(e.target.value) || 0) }
                              : it
                          ),
                        }))
                      }
                      className="w-full px-2 py-1 text-xs border rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-right"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        setData((prev) => ({
                          ...prev,
                          pricing: prev.pricing.filter((it) => it.id !== p.id),
                        }))
                      }
                      disabled={data.pricing.length <= 1}
                      className="text-slate-400 hover:text-rose-600 disabled:opacity-30 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Total Proposal Investment: {formatCurrency(total, data.currencySymbol)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Printable Complete Proposal Preview */
        <div className="bg-slate-100 dark:bg-slate-950 p-6 rounded-2xl flex justify-center overflow-x-auto">
          <div
            id="printable-proposal"
            className="w-[794px] min-h-[1123px] bg-white text-slate-900 p-12 rounded-lg shadow-xl space-y-10 print:shadow-none print:m-0"
          >
            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 block mb-2">
                Business & Technical Proposal
              </span>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                {data.proposalTitle}
              </h1>
              <p className="text-sm text-slate-600 font-medium">{data.proposalSubtitle}</p>

              <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Prepared For
                  </span>
                  <p className="font-bold text-slate-900">{data.preparedFor.clientName}</p>
                  <p className="text-slate-600">{data.preparedFor.clientCompany}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Prepared By
                  </span>
                  <p className="font-bold text-slate-900">{data.preparedBy.authorName}</p>
                  <p className="text-slate-600">{data.preparedBy.agencyCompany}</p>
                </div>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Executive Summary
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">{data.executiveSummary}</p>
            </div>

            {/* Problem & Solution */}
            <div className="grid grid-cols-2 gap-6 pt-2">
              <div className="space-y-1.5 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800">The Challenge</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{data.problemStatement}</p>
              </div>
              <div className="space-y-1.5 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <h4 className="text-xs font-bold text-emerald-900">The Solution</h4>
                <p className="text-xs text-emerald-800 leading-relaxed">{data.proposedSolution}</p>
              </div>
            </div>

            {/* Milestones */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                2. Project Timeline & Delivery Milestones
              </h3>
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-200 text-xs">
                {data.milestones.map((m) => (
                  <div key={m.id} className="p-3 flex justify-between items-start">
                    <div>
                      <span className="font-bold text-slate-800">{m.phase}</span>
                      <p className="text-slate-500 mt-0.5">{m.deliverables}</p>
                    </div>
                    <span className="font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px] shrink-0">
                      {m.duration}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                3. Scope & Commercial Terms
              </h3>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-400 uppercase text-[10px]">
                    <th className="py-2">Milestone / Scope</th>
                    <th className="py-2 text-right">Qty</th>
                    <th className="py-2 text-right">Rate</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.pricing.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2.5">
                        <span className="font-semibold text-slate-800">{p.item}</span>
                        {p.description && (
                          <p className="text-[11px] text-slate-500">{p.description}</p>
                        )}
                      </td>
                      <td className="py-2.5 text-right text-slate-600">{p.qty}</td>
                      <td className="py-2.5 text-right text-slate-600">
                        {formatCurrency(p.rate, data.currencySymbol)}
                      </td>
                      <td className="py-2.5 text-right font-semibold text-slate-900">
                        {formatCurrency(p.qty * p.rate, data.currencySymbol)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end pt-3 border-t border-slate-200">
                <span className="text-base font-bold text-slate-900">
                  Total Investment: {formatCurrency(total, data.currencySymbol)}
                </span>
              </div>
            </div>

            {/* Terms */}
            {data.terms && (
              <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-1">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Terms & Acceptance
                </span>
                <p className="whitespace-pre-line leading-relaxed">{data.terms}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
