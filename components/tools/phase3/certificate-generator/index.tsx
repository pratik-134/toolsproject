"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CertificateData,
  DEFAULT_CERTIFICATE,
  CERTIFICATE_TEMPLATES,
  generateCertificateId,
} from "./logic";
import {
  Award,
  Printer,
  RotateCcw,
  Upload,
  ShieldCheck,
  CheckCircle,
  FileCheck,
} from "lucide-react";

const STORAGE_KEY = "ct_certificate_draft";

export default function CertificateGeneratorTool() {
  const [data, setData] = useState<CertificateData>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return DEFAULT_CERTIFICATE;
  });

  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const signatureInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // storage quota guard
    }
  }, [data]);

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setData((prev) => ({ ...prev, signatureUrl: event.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    if (window.confirm("Reset certificate to default values?")) {
      setData(DEFAULT_CERTIFICATE);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-20 lg:pb-0">
      {/* Privacy Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="leading-relaxed">Certificate & Diploma Generator — 100% In-Browser. No data uploaded.</span>
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
            Certificate Content
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
            Landscape A4 Preview
          </button>
        </div>

        {/* Template selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium whitespace-nowrap">Style:</label>
          <Select
            value={data.template}
            onValueChange={(val) =>
              setData((prev) => ({
                ...prev,
                template: val as CertificateData["template"],
              }))
            }
          >
            <SelectTrigger className="h-8 px-2.5 text-xs rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 w-36 font-medium">
              <SelectValue placeholder="Style" />
            </SelectTrigger>
            <SelectContent>
              {CERTIFICATE_TEMPLATES.map((tmpl) => (
                <SelectItem key={tmpl.id} value={tmpl.id}>
                  {tmpl.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {activeTab === "edit" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Recipient & Course */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Award className="w-4 h-4 text-amber-500" /> Award Recipient & Achievement
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Recipient Full Name (Presented To)
                </label>
                <input
                  type="text"
                  value={data.recipientName}
                  onChange={(e) => setData((prev) => ({ ...prev, recipientName: e.target.value }))}
                  className="w-full px-3 py-1.5 text-sm font-semibold border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Course / Achievement / Honor Title
                </label>
                <input
                  type="text"
                  value={data.courseTitle}
                  onChange={(e) => setData((prev) => ({ ...prev, courseTitle: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Citation / Description
                </label>
                <textarea
                  rows={3}
                  value={data.achievementDescription}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, achievementDescription: e.target.value }))
                  }
                  className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 leading-relaxed"
                />
              </div>
            </div>

            {/* Issuing Authority */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <FileCheck className="w-4 h-4 text-emerald-600" /> Issuing Institution & Authority
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Institution / Company Name
                  </label>
                  <input
                    type="text"
                    value={data.organizationName}
                    onChange={(e) =>
                      setData((prev) => ({ ...prev, organizationName: e.target.value }))
                    }
                    className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Subtext / Accreditation
                  </label>
                  <input
                    type="text"
                    value={data.organizationSubtext}
                    onChange={(e) =>
                      setData((prev) => ({ ...prev, organizationSubtext: e.target.value }))
                    }
                    className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Signatory Full Name
                  </label>
                  <input
                    type="text"
                    value={data.signatoryName}
                    onChange={(e) =>
                      setData((prev) => ({ ...prev, signatoryName: e.target.value }))
                    }
                    className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Signatory Title
                  </label>
                  <input
                    type="text"
                    value={data.signatoryTitle}
                    onChange={(e) =>
                      setData((prev) => ({ ...prev, signatoryTitle: e.target.value }))
                    }
                    className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Metadata & ID */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 shadow-sm">
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Verification Details
              </h4>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={data.issueDate}
                  onChange={(e) => setData((prev) => ({ ...prev, issueDate: e.target.value }))}
                  className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Certificate ID
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setData((prev) => ({ ...prev, certificateId: generateCertificateId() }))
                    }
                    className="text-[11px] text-emerald-600 hover:underline"
                  >
                    Regenerate
                  </button>
                </div>
                <input
                  type="text"
                  value={data.certificateId}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, certificateId: e.target.value }))
                  }
                  className="w-full px-2.5 py-1.5 text-xs font-mono border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>

            {/* Signature Upload */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 shadow-sm">
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Authorized Signature
              </h4>
              {data.signatureUrl ? (
                <div className="relative group p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                  <img
                    src={data.signatureUrl}
                    alt="Signature"
                    className="max-h-16 object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setData((prev) => ({ ...prev, signatureUrl: undefined }))}
                    className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md text-xs opacity-80 hover:opacity-100"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    ref={signatureInputRef}
                    accept="image/*"
                    onChange={handleSignatureUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => signatureInputRef.current?.click()}
                    className="w-full text-xs gap-1.5 h-9"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload Signature Image
                  </Button>
                  <p className="text-[10px] text-slate-400 text-center mt-1.5">
                    (Leave empty to render elegant script calligraphy)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Printable Landscape A4 Preview */
        <div className="bg-slate-100 dark:bg-slate-950 p-6 rounded-2xl flex justify-center overflow-x-auto">
          <div
            id="printable-certificate"
            className="w-[1000px] h-[707px] bg-[#faf8f5] text-slate-900 p-10 rounded-lg shadow-2xl relative flex flex-col justify-between print:shadow-none print:m-0"
            style={{
              borderColor: data.template === "royal-navy" ? "#1e293b" : "#d4af37",
            }}
          >
            {/* Border frame */}
            <div
              className={`absolute inset-4 border-4 pointer-events-none rounded-sm ${
                data.template === "classic-gold"
                  ? "border-[#c5a059]"
                  : data.template === "royal-navy"
                  ? "border-[#1e3a8a]"
                  : data.template === "tech-achievement"
                  ? "border-emerald-600"
                  : "border-slate-400"
              }`}
            >
              <div className="absolute inset-1.5 border border-dashed border-current opacity-60 pointer-events-none" />
            </div>

            {/* Inner Content */}
            <div className="relative z-10 text-center pt-8 px-12 space-y-4">
              {/* Institution */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-[#8c6d37]">
                  {data.organizationName}
                </h4>
                {data.organizationSubtext && (
                  <p className="text-[11px] text-slate-500 uppercase tracking-wider mt-0.5">
                    {data.organizationSubtext}
                  </p>
                )}
              </div>

              {/* Title */}
              <div className="pt-2">
                <span className="text-3xl font-serif font-extrabold tracking-widest uppercase text-slate-800 block">
                  Certificate of Achievement
                </span>
                <p className="text-xs text-slate-500 italic mt-1">This is proudly presented to</p>
              </div>

              {/* Recipient */}
              <div className="py-2 border-b-2 border-[#c5a059]/40 max-w-lg mx-auto">
                <span className="text-3xl font-serif font-bold text-slate-900 tracking-wide">
                  {data.recipientName}
                </span>
              </div>

              {/* Achievement */}
              <div className="max-w-xl mx-auto space-y-2">
                <p className="text-sm font-semibold text-slate-800">{data.courseTitle}</p>
                <p className="text-xs text-slate-600 leading-relaxed font-serif">
                  {data.achievementDescription}
                </p>
              </div>
            </div>

            {/* Footer Signatures & Seal */}
            <div className="relative z-10 px-16 pb-6 grid grid-cols-3 items-end">
              {/* Date */}
              <div className="text-left space-y-1">
                <p className="text-xs font-semibold text-slate-800">{data.issueDate}</p>
                <div className="w-32 border-b border-slate-400" />
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                  Date Awarded
                </span>
              </div>

              {/* Central Seal */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full border-4 border-[#c5a059] flex items-center justify-center bg-amber-50 shadow-inner">
                  <CheckCircle className="w-10 h-10 text-[#c5a059]" />
                </div>
                <span className="text-[9px] font-mono text-slate-500 mt-1 uppercase">
                  ID: {data.certificateId}
                </span>
              </div>

              {/* Signatory */}
              <div className="text-right space-y-1 flex flex-col items-end">
                {data.signatureUrl ? (
                  <img
                    src={data.signatureUrl}
                    alt="Signature"
                    className="max-h-12 object-contain"
                  />
                ) : (
                  <span className="font-serif italic text-lg text-slate-800 font-bold block">
                    {data.signatoryName}
                  </span>
                )}
                <div className="w-48 border-b border-slate-400" />
                <p className="text-xs font-semibold text-slate-800">{data.signatoryName}</p>
                <span className="text-[10px] text-slate-500 block">{data.signatoryTitle}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
