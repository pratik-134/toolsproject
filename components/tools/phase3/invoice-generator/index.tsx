"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  InvoiceData,
  InvoiceItem,
  DEFAULT_INVOICE,
  CURRENCY_SYMBOLS,
  calculateInvoiceTotals,
  calculateLineTotal,
  formatCurrency,
} from "./logic";
import {
  Plus,
  Trash2,
  Printer,
  Download,
  RotateCcw,
  Upload,
  FileText,
  ShieldCheck,
  Building,
  User,
  Percent,
} from "lucide-react";

const STORAGE_KEY = "ct_invoice_draft";

export default function InvoiceGeneratorTool() {
  const [data, setData] = useState<InvoiceData>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {
        // Fall back to default
      }
    }
    return DEFAULT_INVOICE;
  });

  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // storage quota or private browsing guard
    }
  }, [data]);

  const totals = calculateInvoiceTotals(
    data.items,
    data.taxRatePercent,
    data.discountPercent
  );

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      description: "Professional Service / Product Item",
      quantity: 1,
      rate: 100,
    };
    setData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const handleUpdateItem = (
    id: string,
    field: keyof InvoiceItem,
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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setData((prev) => ({ ...prev, logoUrl: event.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    if (window.confirm("Reset invoice draft to default values?")) {
      setData(DEFAULT_INVOICE);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    const printEl = document.getElementById("printable-invoice");
    if (!printEl) {
      setIsPrinting(false);
      window.print();
      return;
    }

    // Clone all existing stylesheet links and style tags from current document
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
          <title>Invoice_${data.invoiceNumber || "document"}</title>
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
            #printable-invoice {
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
          <div id="printable-invoice">
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
      {/* Global Print Stylesheet: Ensures even native Ctrl+P prints ONLY the invoice document */}
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
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
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

      {/* Privacy Banner */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 print:hidden">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>100% Client-Side Invoice Builder — Draft saved locally in your browser memory.</span>
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
            onClick={handlePrint}
            disabled={isPrinting}
            className="h-7 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
          >
            <Download className="w-3.5 h-3.5" /> {isPrinting ? "Preparing PDF..." : "Download / Print PDF"}
          </Button>
        </div>
      </div>

      {/* Mode Navigation */}
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
            Editor & Details
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
            Live Document Preview
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
          {/* Main Form: 2 cols */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header info */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" /> Invoice Identifier
                </h3>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-500">Invoice #:</label>
                  <input
                    type="text"
                    value={data.invoiceNumber}
                    onChange={(e) =>
                      setData((prev) => ({ ...prev, invoiceNumber: e.target.value }))
                    }
                    className="w-36 px-2.5 py-1 text-xs border rounded-md font-mono bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={data.issueDate}
                    onChange={(e) =>
                      setData((prev) => ({ ...prev, issueDate: e.target.value }))
                    }
                    className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={data.dueDate}
                    onChange={(e) =>
                      setData((prev) => ({ ...prev, dueDate: e.target.value }))
                    }
                    className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Sender & Client Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sender */}
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 shadow-sm">
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-emerald-600" /> From (Your Business)
                </h4>
                <input
                  type="text"
                  placeholder="Your Name / Business"
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
                  placeholder="Company Name"
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
                  placeholder="Billing Email"
                  value={data.sender.email}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      sender: { ...prev.sender, email: e.target.value },
                    }))
                  }
                  className="w-full px-2.5 py-1.5 text-xs border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <textarea
                  rows={2}
                  placeholder="Full Address & City"
                  value={data.sender.address}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      sender: { ...prev.sender, address: e.target.value },
                    }))
                  }
                  className="w-full px-2.5 py-1.5 text-xs border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              {/* Client */}
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 shadow-sm">
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" /> Billed To (Client)
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
                <textarea
                  rows={2}
                  placeholder="Client Address"
                  value={data.client.address}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      client: { ...prev.client, address: e.target.value },
                    }))
                  }
                  className="w-full px-2.5 py-1.5 text-xs border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            {/* Line Items */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Line Items & Services
                </h3>
                <Button
                  size="sm"
                  onClick={handleAddItem}
                  className="h-7 text-xs gap-1 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {data.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-2 items-center p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <div className="col-span-12 sm:col-span-6">
                      <input
                        type="text"
                        placeholder="Item description"
                        value={item.description}
                        onChange={(e) =>
                          handleUpdateItem(item.id, "description", e.target.value)
                        }
                        className="w-full px-2.5 py-1 text-xs border rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateItem(item.id, "quantity", e.target.value)
                        }
                        className="w-full px-2.5 py-1 text-xs border rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Rate"
                        value={item.rate}
                        onChange={(e) =>
                          handleUpdateItem(item.id, "rate", e.target.value)
                        }
                        className="w-full px-2.5 py-1 text-xs border rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div className="col-span-3 sm:col-span-1 text-right text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono">
                      {formatCurrency(
                        calculateLineTotal(item.quantity, item.rate),
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
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Settings & Totals: 1 col */}
          <div className="space-y-6">
            {/* Logo Upload */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 shadow-sm">
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Company Brand Logo
              </h4>
              {data.logoUrl ? (
                <div className="relative group p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                  <img
                    src={data.logoUrl}
                    alt="Logo"
                    className="max-h-16 object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setData((prev) => ({ ...prev, logoUrl: undefined }))}
                    className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md text-xs opacity-80 hover:opacity-100"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    ref={logoInputRef}
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => logoInputRef.current?.click()}
                    className="w-full text-xs gap-1.5 h-9"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload Logo (PNG/JPG)
                  </Button>
                </div>
              )}
            </div>

            {/* Calculations & Discounts */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 shadow-sm">
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Taxes & Adjustments
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

              {/* Summary table */}
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
                {totals.taxAmount > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Tax ({data.taxRatePercent}%):</span>
                    <span>+{formatCurrency(totals.taxAmount, data.currencySymbol)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Grand Total:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(totals.total, data.currencySymbol)}
                  </span>
                </div>
              </div>
            </div>

            {/* Terms & Notes */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 shadow-sm">
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Payment Terms & Notes
              </h4>
              <textarea
                rows={3}
                value={data.notes}
                onChange={(e) => setData((prev) => ({ ...prev, notes: e.target.value }))}
                className="w-full px-2.5 py-1.5 text-xs border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>
        </div>

      {/* Printable Vector Preview (Always mounted in DOM for iframe and print engine) */}
      <div className={activeTab === "preview" ? "bg-slate-100 dark:bg-slate-950 p-6 rounded-2xl flex justify-center overflow-x-auto print:bg-white print:p-0" : "hidden print:block"}>
        <div
          id="printable-invoice"
          className="w-[794px] min-h-[1123px] bg-white text-slate-900 p-12 rounded-lg shadow-xl space-y-8 print:shadow-none print:p-0 print:m-0 print:w-full print:max-w-none"
        >
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-8">
              <div>
                {data.logoUrl ? (
                  <img
                    src={data.logoUrl}
                    alt="Logo"
                    className="max-h-16 max-w-[200px] object-contain mb-3"
                  />
                ) : (
                  <div className="text-2xl font-black tracking-tight text-slate-900 mb-1">
                    {data.sender.company || data.sender.name}
                  </div>
                )}
                <p className="text-xs text-slate-500 whitespace-pre-line max-w-sm">
                  {data.sender.address}
                </p>
                {data.sender.email && (
                  <p className="text-xs text-slate-500">{data.sender.email}</p>
                )}
                {data.sender.phone && (
                  <p className="text-xs text-slate-500">{data.sender.phone}</p>
                )}
              </div>

              <div className="text-right">
                <span className="text-3xl font-extrabold tracking-tight text-slate-900 block mb-2">
                  INVOICE
                </span>
                <p className="text-xs font-mono font-semibold text-slate-600">
                  #{data.invoiceNumber}
                </p>
                <div className="mt-3 text-xs text-slate-500 space-y-1">
                  <p>
                    <span className="font-medium text-slate-700">Date:</span> {data.issueDate}
                  </p>
                  <p>
                    <span className="font-medium text-slate-700">Due:</span> {data.dueDate}
                  </p>
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div className="border-b border-slate-200 pb-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Billed To
              </span>
              <p className="text-sm font-bold text-slate-900">{data.client.name}</p>
              {data.client.company && (
                <p className="text-xs font-semibold text-slate-700">{data.client.company}</p>
              )}
              <p className="text-xs text-slate-500 whitespace-pre-line max-w-sm">
                {data.client.address}
              </p>
              {data.client.email && (
                <p className="text-xs text-slate-500">{data.client.email}</p>
              )}
            </div>

            {/* Table */}
            <div>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2">Description</th>
                    <th className="py-2 text-right">Qty</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 font-medium text-slate-800">{item.description}</td>
                      <td className="py-3 text-right text-slate-600">{item.quantity}</td>
                      <td className="py-3 text-right text-slate-600">
                        {formatCurrency(item.rate, data.currencySymbol)}
                      </td>
                      <td className="py-3 text-right font-semibold text-slate-900">
                        {formatCurrency(
                          calculateLineTotal(item.quantity, item.rate),
                          data.currencySymbol
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Breakdown */}
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
                {totals.taxAmount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Tax ({data.taxRatePercent}%):</span>
                    <span>+{formatCurrency(totals.taxAmount, data.currencySymbol)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-300">
                  <span>Total Due:</span>
                  <span>{formatCurrency(totals.total, data.currencySymbol)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {data.notes && (
              <div className="pt-8 border-t border-slate-200 text-xs text-slate-500">
                <p className="font-semibold text-slate-700 mb-1">Notes & Terms:</p>
                <p className="whitespace-pre-line">{data.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
