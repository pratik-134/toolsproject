"use client";

import React, { useState, useRef } from "react";
import {
  FileText,
  Upload,
  Download,
  Plus,
  Trash2,
  Check,
  RefreshCw,
  Sparkles,
  AlertCircle,
  FileCheck,
  FormInput,
  CheckSquare,
  ListFilter,
} from "lucide-react";
import {
  createBlankPdfForFormBuilder,
  addFormFieldsToPdf,
  NewFieldDef,
} from "./logic";
import { PDFDocument } from "pdf-lib";

export default function PdfFormBuilderTool() {
  const [fileBuffer, setFileBuffer] = useState<Uint8Array | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<number>(0);
  const [pageCount, setPageCount] = useState<number>(0);

  const [fields, setFields] = useState<NewFieldDef[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    try {
      const arrayBuf = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuf);
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });

      setFileBuffer(buffer);
      setFileName(file.name);
      setFileSize(file.size);
      setPageCount(doc.getPageCount());
      setFields([]);
      setDownloadUrl(null);
    } catch (err: any) {
      setError(`Failed to read PDF: ${err?.message || "Invalid or encrypted file"}`);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleLoadSample = async () => {
    setError(null);
    setIsProcessing(true);
    try {
      const sample = await createBlankPdfForFormBuilder();
      const doc = await PDFDocument.load(sample);

      setFileBuffer(sample);
      setFileName("Form_Template_Document.pdf");
      setFileSize(sample.length);
      setPageCount(doc.getPageCount());
      // Populate 3 default field entries
      setFields([
        {
          id: "f1",
          name: "applicant_name",
          type: "text",
          pageIndex: 0,
          x: 50,
          y: 680,
          width: 250,
          height: 24,
          defaultValue: "John Smith",
        },
        {
          id: "f2",
          name: "account_type",
          type: "dropdown",
          pageIndex: 0,
          x: 50,
          y: 620,
          width: 200,
          height: 24,
          defaultValue: "Personal",
          options: ["Personal", "Business", "Non-Profit"],
        },
        {
          id: "f3",
          name: "terms_agreement",
          type: "checkbox",
          pageIndex: 0,
          x: 50,
          y: 560,
          width: 18,
          height: 18,
          defaultValue: "checked",
        },
      ]);
      setDownloadUrl(null);
    } catch (err: any) {
      setError(`Failed to load template: ${err?.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const addField = (type: "text" | "checkbox" | "dropdown") => {
    const newIdx = fields.length + 1;
    const yPos = Math.max(100, 700 - newIdx * 60);

    const newField: NewFieldDef = {
      id: Math.random().toString(36).substring(2, 9),
      name: `field_${type}_${newIdx}`,
      type,
      pageIndex: 0,
      x: 50,
      y: yPos,
      width: type === "checkbox" ? 18 : 220,
      height: type === "checkbox" ? 18 : 24,
      defaultValue: type === "checkbox" ? "false" : "",
      options: type === "dropdown" ? ["Option A", "Option B", "Option C"] : undefined,
    };
    setFields((prev) => [...prev, newField]);
    setDownloadUrl(null);
  };

  const removeField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    setDownloadUrl(null);
  };

  const updateField = (id: string, updates: Partial<NewFieldDef>) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
    setDownloadUrl(null);
  };

  const handleGenerate = async () => {
    if (!fileBuffer) return;
    if (fields.length === 0) {
      setError("Please add at least one form field to insert.");
      return;
    }
    setError(null);
    setIsProcessing(true);

    try {
      const generatedBytes = await addFormFieldsToPdf(fileBuffer, fields);
      const blob = new Blob([generatedBytes as unknown as BlobPart], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err: any) {
      setError(`Failed to build form: ${err?.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const resetAll = () => {
    setFileBuffer(null);
    setFileName("");
    setFileSize(0);
    setPageCount(0);
    setFields([]);
    setDownloadUrl(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Privacy Guarantee Banner */}
      <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs md:text-sm text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>
            <strong>100% Client-Side Privacy:</strong> Interactive form creation runs in your browser memory. No documents leave your device.
          </span>
        </div>
        <button
          onClick={handleLoadSample}
          disabled={isProcessing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-xs shadow-sm transition-colors whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load Demo Template
        </button>
      </div>

      {/* Upload Zone */}
      {!fileBuffer ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
              <FormInput className="w-7 h-7" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
                Click to upload or drag & drop a PDF
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Insert interactive text fields, checkboxes, and dropdowns into any PDF page.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* File Card */
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {fileName}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatFileSize(fileSize)} • {pageCount} Pages • {fields.length} {fields.length === 1 ? "field configured" : "fields configured"}
              </p>
            </div>
          </div>
          <button
            onClick={resetAll}
            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="Remove document"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl text-sm text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Field Editor */}
      {fileBuffer && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Form Fields to Insert ({fields.length})
            </h4>

            {/* Add Field Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => addField("text")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Text Input
              </button>
              <button
                onClick={() => addField("checkbox")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Checkbox
              </button>
              <button
                onClick={() => addField("dropdown")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Dropdown
              </button>
            </div>
          </div>

          {/* Fields List */}
          <div className="space-y-3">
            {fields.map((field, idx) => (
              <div
                key={field.id}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                      {field.type} Field
                    </span>
                  </div>

                  <button
                    onClick={() => removeField(field.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors"
                    title="Remove Field"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Field Key / ID
                    </label>
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => updateField(field.id, { name: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Target Page #
                    </label>
                    <select
                      value={field.pageIndex}
                      onChange={(e) =>
                        updateField(field.id, {
                          pageIndex: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {Array.from({ length: Math.max(pageCount, 1) }, (_, i) => (
                        <option key={i} value={i}>
                          Page {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Position (X, Y)
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={field.x}
                        onChange={(e) =>
                          updateField(field.id, { x: parseInt(e.target.value, 10) || 0 })
                        }
                        className="w-1/2 px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                        placeholder="X"
                      />
                      <input
                        type="number"
                        value={field.y}
                        onChange={(e) =>
                          updateField(field.id, { y: parseInt(e.target.value, 10) || 0 })
                        }
                        className="w-1/2 px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                        placeholder="Y"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Size (Width × Height)
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={field.width}
                        onChange={(e) =>
                          updateField(field.id, { width: parseInt(e.target.value, 10) || 20 })
                        }
                        className="w-1/2 px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                        placeholder="W"
                      />
                      <input
                        type="number"
                        value={field.height}
                        onChange={(e) =>
                          updateField(field.id, { height: parseInt(e.target.value, 10) || 20 })
                        }
                        className="w-1/2 px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                        placeholder="H"
                      />
                    </div>
                  </div>
                </div>

                {field.type === "dropdown" && (
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Dropdown Options (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={field.options?.join(", ") ?? ""}
                      onChange={(e) =>
                        updateField(field.id, {
                          options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                      placeholder="Choice 1, Choice 2, Choice 3"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={isProcessing || fields.length === 0}
            className="w-full inline-flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-md transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Building Fillable Form in Memory...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Generate Fillable PDF ({fields.length} Form Fields)
              </>
            )}
          </button>
        </div>
      )}

      {/* Result Panel */}
      {downloadUrl && (
        <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-700 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Fillable Form Generated!
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {fields.length} interactive AcroForm widgets embedded into your document.
              </p>
            </div>
          </div>
          <a
            href={downloadUrl}
            download={`fillable-${fileName || "form.pdf"}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all"
          >
            <Download className="w-4 h-4" />
            Download Fillable PDF
          </a>
        </div>
      )}
    </div>
  );
}
