"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  QuoteData,
  QuoteItem,
  DEFAULT_QUOTE,
  calculateQuoteTotals,
  calculateQuoteItemTotal,
} from "./logic";
import { CURRENCY_SYMBOLS, formatCurrency } from "../invoice-generator/logic";
import {
  Plus,
  Trash2,
  Printer,
  RotateCcw,
  ShieldCheck,
  Building,
  User,
  Calculator,
  Briefcase,
} from "lucide-react";

const STORAGE_KEY = "ct_quote_draft";

export default function EstimateQuoteBuilderTool() {
  const [data, setData] = useState<QuoteData>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return DEFAULT_QUOTE;
  });

  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // storage quota guard
    }
  }, [data]);

  const totals = calculateQuoteTotals(
    data.items,
    data.taxRatePercent,
    data.discountPercent
  );

  const handleAddItem = () => {
    const newItem: QuoteItem = {
      id: `quote-${Date.now()}`,
      service: "Additional Scope Deliverable",
      description: "Description of the milestone or technical service deliverable.",
      quantity: 8,
      unit: "hours",
      rate: 125,
    };
    setData((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const handleUpdateItem = (
    id: string,
    field: keyof QuoteItem,
    val: string | number
  ) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((it) =>
        it.id === id
          ? {
              ...it,
              [field]:
                field === "quantity" || field === "rate"
                  ? Math.max(0, Number(val) || 0)
                  : String(val),
            }
          : it
      ),
    }));
  };

  const handleRemoveItem = (id: string) => {
    if (data.items.length <= 1) return;
    setData((prev) => ({
      ...prev,
      items: prev.items.filter((it) => it.id !== id),
    }));
  };

  const handleReset = () => {
    if (window.confirm("Reset estimate to default template?")) {
      setData(DEFAULT_QUOTE);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    const printEl = document.getElementById("printable-quote");
    if (!printEl) {
      setIsPrinting(false);
      window.print();
      return;
    }

    const styleTags = Array.from(document.querySelectorAll("link[rel='stylesheet'], style"))
      .map((tag) => tag.outerHTML)
      .join("\n");

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      setIsPrinting(false);
      window.print();
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Quote_${data.quoteNumber || "document"}</title>
          ${styleTags}
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 15mm 15mm 15mm;
            }
            html, body {
              background: #ffffff !important;
              color: #0f172a !important;
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            #printable-quote {
              width: 100% !important;
              max-width: 100% !important;
              min-height: auto !important;
              padding: 0 !important;
              margin: 0 !important;
              box-shadow: none !important;
              border: none !important;
              background: #ffffff !important;
            }
          </style>
        </head>
        <body class="bg-white text-slate-900">
          <div id="printable-quote">
            ${printEl.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error("Print error:", err);
      } finally {
        setTimeout(() => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
          setIsPrinting(false);
        }, 1500);
      }
    }, 350);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Global Print Stylesheet */}
      <style jsx global>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          header, footer, nav, aside, [role="region"], #mobile-navigation-drawer, aside {
            display: none !important;
          }
          body * {
            visibility: hidden;
          }
          #printable-quote, #printable-quote * {
            visibility: visible;
          }
          #printable-quote {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 10mm 12mm !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }
        }
      `}</style>

      {/* Privacy Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 print:hidden">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="leading-relaxed">Client-Side Quote & Estimate Builder — Private & stored on device only.</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
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
            onClick={handlePrint}
            disabled={isPrinting}
            className="h-7 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" /> {isPrinting ? "Preparing PDF..." : "Print / Export PDF"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 print:hidden">
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
            Edit Estimate Scope
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
            Printable Quote Preview
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium">Currency:</label>
          <select
            value={data.currency}
            onChange={(e) => {
              const cur = e.target.value;
              setData((prev) => ({
                ...prev,
                currency: cur,
                currencySymbol: CURRENCY_SYMBOLS[cur] || "$",
              }));
            }}
            className="text-xs px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          >
            {Object.keys(CURRENCY_SYMBOLS).map((c) => (
              <option key={c} value={c}>
                {c} ({CURRENCY_SYMBOLS[c]})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Editor Workspace */}
      <div className={activeTab === "edit" ? "grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden" : "hidden print:hidden"}>
        <div className="lg:col-span-2 space-y-6">
            {/* Project Title & Metadata */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-600" /> Project & Scope Overview
                </h3>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-500">Estimate #:</label>
                  <input
                    type="text"
                    value={data.quoteNumber}
                    onChange={(e) => setData((prev) => ({ ...prev, quoteNumber: e.target.value }))}
                    className="w-36 px-2.5 py-1 text-xs border rounded-md font-mono bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  value={data.projectTitle}
                  onChange={(e) => setData((prev) => ({ ...prev, projectTitle: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Scope Summary / Introduction
                </label>
                <textarea
                  rows={2}
                  value={data.projectScope}
                  onChange={(e) => setData((prev) => ({ ...prev, projectScope: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Estimate Date
                  </label>
                  <input
                    type="date"
                    value={data.issueDate}
                    onChange={(e) => setData((prev) => ({ ...prev, issueDate: e.target.value }))}
                    className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Valid Until (Expiration)
                  </label>
                  <input
                    type="date"
                    value={data.validUntilDate}
                    onChange={(e) =>
                      setData((prev) => ({ ...prev, validUntilDate: e.target.value }))
                    }
                    className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Parties */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 shadow-sm">
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-emerald-600" /> Prepared By (Consultant/Agency)
                </h4>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={data.sender.name}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      sender: { ...prev.sender, name: e.target.value },
                    }))
                  }
                  className="w-full px-2.5 py-1.5 text-xs border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <input
                  type="text"
                  placeholder="Agency / Company"
                  value={data.sender.company}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      sender: { ...prev.sender, company: e.target.value },
                    }))
                  }
                  className="w-full px-2.5 py-1.5 text-xs border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={data.sender.email}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      sender: { ...prev.sender, email: e.target.value },
                    }))
                  }
                  className="w-full px-2.5 py-1.5 text-xs border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 shadow-sm">
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" /> Client Organization
                </h4>
                <input
                  type="text"
                  placeholder="Client Contact Name"
                  value={data.client.name}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      client: { ...prev.client, name: e.target.value },
                    }))
                  }
                  className="w-full px-2.5 py-1.5 text-xs border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <input
                  type="text"
                  placeholder="Client Company"
                  value={data.client.company}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      client: { ...prev.client, company: e.target.value },
                    }))
                  }
                  className="w-full px-2.5 py-1.5 text-xs border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <input
                  type="email"
                  placeholder="Client Email"
                  value={data.client.email}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      client: { ...prev.client, email: e.target.value },
                    }))
                  }
                  className="w-full px-2.5 py-1.5 text-xs border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            {/* Scope Items */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Scope & Deliverable Breakdown
                </h3>
                <Button
                  size="sm"
                  onClick={handleAddItem}
                  className="h-7 text-xs gap-1 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Line
                </Button>
              </div>

              <div className="space-y-3">
                {data.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2"
                  >
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-12 sm:col-span-5">
                        <input
                          type="text"
                          placeholder="Service title"
                          value={item.service}
                          onChange={(e) => handleUpdateItem(item.id, "service", e.target.value)}
                          className="w-full px-2.5 py-1 text-xs font-medium border rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                        />
                      </div>
                      <div className="col-span-4 sm:col-span-2">
                        <input
                          type="number"
                          min="1"
                          placeholder="Hours/Units"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(item.id, "quantity", e.target.value)}
                          className="w-full px-2.5 py-1 text-xs border rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                        />
                      </div>
                      <div className="col-span-4 sm:col-span-2">
                        <input
                          type="number"
                          min="0"
                          placeholder="Rate"
                          value={item.rate}
                          onChange={(e) => handleUpdateItem(item.id, "rate", e.target.value)}
                          className="w-full px-2.5 py-1 text-xs border rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                        />
                      </div>
                      <div className="col-span-3 sm:col-span-2 text-right text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono">
                        {formatCurrency(
                          calculateQuoteItemTotal(item.quantity, item.rate),
                          data.currencySymbol
                        )}
                      </div>
                      <div className="col-span-1 sm:col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={data.items.length <= 1}
                          className="text-slate-400 hover:text-rose-600 disabled:opacity-30 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Detailed deliverables & description..."
                      value={item.description}
                      onChange={(e) => handleUpdateItem(item.id, "description", e.target.value)}
                      className="w-full px-2.5 py-1 text-xs border rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 shadow-sm">
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-emerald-600" /> Totals & Discount
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">Discount (%):</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={data.discountPercent}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        discountPercent: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                      }))
                    }
                    className="w-20 px-2 py-1 text-xs border rounded-md text-right border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">Tax / VAT (%):</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={data.taxRatePercent}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        taxRatePercent: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                      }))
                    }
                    className="w-20 px-2 py-1 text-xs border rounded-md text-right border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(totals.subtotal, data.currencySymbol)}</span>
                </div>
                {totals.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount ({data.discountPercent}%):</span>
                    <span>-{formatCurrency(totals.discountAmount, data.currencySymbol)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Estimated Total:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(totals.grandTotal, data.currencySymbol)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 shadow-sm">
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Terms & Conditions
              </h4>
              <textarea
                rows={5}
                value={data.terms}
                onChange={(e) => setData((prev) => ({ ...prev, terms: e.target.value }))}
                className="w-full px-2.5 py-1.5 text-xs border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>
        </div>

      {/* Printable Vector Preview (Always mounted in DOM for iframe and print engine) */}
      <div className={activeTab === "preview" ? "bg-slate-100 dark:bg-slate-950 p-6 rounded-2xl flex justify-center overflow-x-auto print:bg-white print:p-0" : "hidden print:block"}>
        <div
          id="printable-quote"
            className="w-[794px] min-h-[1123px] bg-white text-slate-900 p-12 rounded-lg shadow-xl space-y-8 print:shadow-none print:p-0 print:m-0"
          >
            <div className="flex justify-between items-start border-b border-slate-200 pb-8">
              <div>
                <span className="text-2xl font-black tracking-tight text-slate-900 block mb-1">
                  {data.sender.company || data.sender.name}
                </span>
                <p className="text-xs text-slate-500 whitespace-pre-line max-w-sm">
                  {data.sender.address}
                </p>
                {data.sender.email && (
                  <p className="text-xs text-slate-500">{data.sender.email}</p>
                )}
              </div>

              <div className="text-right">
                <span className="text-3xl font-extrabold tracking-tight text-slate-900 block mb-2">
                  ESTIMATE / QUOTE
                </span>
                <p className="text-xs font-mono font-semibold text-slate-600">#{data.quoteNumber}</p>
                <div className="mt-3 text-xs text-slate-500 space-y-1">
                  <p>
                    <span className="font-medium text-slate-700">Date:</span> {data.issueDate}
                  </p>
                  <p>
                    <span className="font-medium text-slate-700">Valid Until:</span>{" "}
                    {data.validUntilDate}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Project Scope
              </span>
              <h2 className="text-lg font-bold text-slate-900 mb-1">{data.projectTitle}</h2>
              <p className="text-xs text-slate-600 leading-relaxed">{data.projectScope}</p>
            </div>

            <div className="border-t border-b border-slate-200 py-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Prepared For
                </span>
                <p className="text-xs font-bold text-slate-900">{data.client.name}</p>
                <p className="text-xs text-slate-600">{data.client.company}</p>
                <p className="text-xs text-slate-500">{data.client.email}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Prepared By
                </span>
                <p className="text-xs font-bold text-slate-900">{data.sender.name}</p>
                <p className="text-xs text-slate-600">{data.sender.company}</p>
                <p className="text-xs text-slate-500">{data.sender.email}</p>
              </div>
            </div>

            <div>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2">Deliverable / Scope</th>
                    <th className="py-2 text-right">Units</th>
                    <th className="py-2 text-right">Rate</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3">
                        <p className="font-semibold text-slate-800">{item.service}</p>
                        {item.description && (
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                        )}
                      </td>
                      <td className="py-3 text-right text-slate-600">{item.quantity}</td>
                      <td className="py-3 text-right text-slate-600">
                        {formatCurrency(item.rate, data.currencySymbol)}
                      </td>
                      <td className="py-3 text-right font-semibold text-slate-900">
                        {formatCurrency(
                          calculateQuoteItemTotal(item.quantity, item.rate),
                          data.currencySymbol
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(totals.subtotal, data.currencySymbol)}</span>
                </div>
                {totals.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount ({data.discountPercent}%):</span>
                    <span>-{formatCurrency(totals.discountAmount, data.currencySymbol)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-300">
                  <span>Total Estimate:</span>
                  <span className="text-emerald-600">
                    {formatCurrency(totals.grandTotal, data.currencySymbol)}
                  </span>
                </div>
              </div>
            </div>

            {data.terms && (
              <div className="pt-8 border-t border-slate-200 text-xs text-slate-500">
                <p className="font-semibold text-slate-700 mb-1">Estimate Terms & Conditions:</p>
                <p className="whitespace-pre-line leading-relaxed">{data.terms}</p>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
