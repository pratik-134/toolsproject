import React, { useState, useRef } from "react";
import {
  X,
  FileText,
  FileSpreadsheet,
  Presentation,
  Image as ImageIcon,
  FileCode,
  Download,
  Upload,
  Loader2,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import {
  exportPdfToDocx,
  exportPdfToExcel,
  exportPdfToPptx,
  exportPdfToImagesZip,
  exportPdfToText,
  exportPdfToHtml,
  convertImagesToPdf,
  convertWordToPdf,
  convertExcelToPdf,
} from "../conversion";

interface ConvertModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawPdfDoc: any;
  fileName: string;
  onLoadNewPdf: (bytes: Uint8Array, name: string) => void;
}

export const ConvertModal: React.FC<ConvertModalProps> = ({
  isOpen,
  onClose,
  rawPdfDoc,
  fileName,
  onLoadNewPdf,
}) => {
  const [activeTab, setActiveTab] = useState<"from-pdf" | "to-pdf">("from-pdf");
  const [isConverting, setIsConverting] = useState(false);
  const [currentAction, setCurrentAction] = useState<string | null>(null);

  const imagesInputRef = useRef<HTMLInputElement | null>(null);
  const wordInputRef = useRef<HTMLInputElement | null>(null);
  const excelInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const triggerDownload = (blob: Blob, downloadName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async (format: "docx" | "xlsx" | "pptx" | "jpg" | "png" | "txt" | "html") => {
    if (!rawPdfDoc) return;
    setIsConverting(true);
    setCurrentAction(`Exporting as ${format.toUpperCase()}...`);
    try {
      const baseName = fileName.replace(/\.[^/.]+$/, "");
      switch (format) {
        case "docx": {
          const blob = await exportPdfToDocx(rawPdfDoc, fileName);
          triggerDownload(blob, `${baseName}.docx`);
          break;
        }
        case "xlsx": {
          const blob = await exportPdfToExcel(rawPdfDoc, fileName);
          triggerDownload(blob, `${baseName}-data.csv`);
          break;
        }
        case "pptx": {
          const blob = await exportPdfToPptx(rawPdfDoc, fileName);
          triggerDownload(blob, `${baseName}-slides.pptx`);
          break;
        }
        case "jpg":
        case "png": {
          const blob = await exportPdfToImagesZip(rawPdfDoc, baseName, format);
          triggerDownload(blob, `${baseName}-${format}-pages.zip`);
          break;
        }
        case "txt": {
          const text = await exportPdfToText(rawPdfDoc);
          const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
          triggerDownload(blob, `${baseName}.txt`);
          break;
        }
        case "html": {
          const html = await exportPdfToHtml(rawPdfDoc, fileName);
          const blob = new Blob([html], { type: "text/html;charset=utf-8" });
          triggerDownload(blob, `${baseName}.html`);
          break;
        }
      }
    } catch (err) {
      console.error("Conversion error:", err);
      alert("Failed to convert document.");
    } finally {
      setIsConverting(false);
      setCurrentAction(null);
    }
  };

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsConverting(true);
    setCurrentAction("Converting images to PDF...");
    try {
      const pdfBytes = await convertImagesToPdf(files);
      onLoadNewPdf(pdfBytes, `${files[0]?.name.replace(/\.[^/.]+$/, "") || "images"}-compiled.pdf`);
      onClose();
    } catch (err) {
      console.error("Images to PDF error:", err);
      alert("Failed to convert images to PDF.");
    } finally {
      setIsConverting(false);
      setCurrentAction(null);
    }
  };

  const handleWordUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsConverting(true);
    setCurrentAction("Converting Word (.docx) to PDF...");
    try {
      const pdfBytes = await convertWordToPdf(file);
      onLoadNewPdf(pdfBytes, `${file.name.replace(/\.[^/.]+$/, "")}-converted.pdf`);
      onClose();
    } catch (err) {
      console.error("Word to PDF error:", err);
      alert("Failed to convert Word document.");
    } finally {
      setIsConverting(false);
      setCurrentAction(null);
    }
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsConverting(true);
    setCurrentAction("Converting Spreadsheet to PDF...");
    try {
      const pdfBytes = await convertExcelToPdf(file);
      onLoadNewPdf(pdfBytes, `${file.name.replace(/\.[^/.]+$/, "")}-spreadsheet.pdf`);
      onClose();
    } catch (err) {
      console.error("Excel to PDF error:", err);
      alert("Failed to convert Spreadsheet to PDF.");
    } finally {
      setIsConverting(false);
      setCurrentAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-card text-foreground border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">Document Format Conversions</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 pt-4 pb-2 border-b border-border/60 bg-muted/20 flex gap-2">
          <button
            onClick={() => setActiveTab("from-pdf")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "from-pdf"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            Export from PDF (7 formats)
          </button>
          <button
            onClick={() => setActiveTab("to-pdf")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "to-pdf"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            Convert to PDF (Images, Word, Excel)
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[65vh]">
          {isConverting ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="text-sm font-medium text-foreground">{currentAction}</span>
              <span className="text-xs text-muted-foreground">Running client-side in browser memory...</span>
            </div>
          ) : activeTab === "from-pdf" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* PDF to Word */}
              <div
                onClick={() => handleExport("docx")}
                className="p-4 rounded-xl border border-border bg-card/60 hover:bg-muted/60 cursor-pointer transition-all hover:border-blue-500/50 group flex items-start gap-3.5"
              >
                <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                    PDF to Microsoft Word
                    <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded-sm font-mono">.docx</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Extracts headings, paragraphs, and formatted text blocks.
                  </p>
                </div>
              </div>

              {/* PDF to Excel */}
              <div
                onClick={() => handleExport("xlsx")}
                className="p-4 rounded-xl border border-border bg-card/60 hover:bg-muted/60 cursor-pointer transition-all hover:border-emerald-500/50 group flex items-start gap-3.5"
              >
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0 group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                    PDF to Excel / CSV
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-700 rounded-sm font-mono">.csv</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Detects tabular coordinates and groups data into rows and columns.
                  </p>
                </div>
              </div>

              {/* PDF to PowerPoint */}
              <div
                onClick={() => handleExport("pptx")}
                className="p-4 rounded-xl border border-border bg-card/60 hover:bg-muted/60 cursor-pointer transition-all hover:border-amber-500/50 group flex items-start gap-3.5"
              >
                <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600 shrink-0 group-hover:scale-105 transition-transform">
                  <Presentation className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                    PDF to PowerPoint
                    <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-700 rounded-sm font-mono">.pptx</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Converts pages into structured presentation slides.
                  </p>
                </div>
              </div>

              {/* PDF to PNG */}
              <div
                onClick={() => handleExport("png")}
                className="p-4 rounded-xl border border-border bg-card/60 hover:bg-muted/60 cursor-pointer transition-all hover:border-purple-500/50 group flex items-start gap-3.5"
              >
                <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-600 shrink-0 group-hover:scale-105 transition-transform">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                    PDF to High-Res PNG
                    <span className="text-[10px] px-1.5 py-0.2 bg-purple-100 text-purple-700 rounded-sm font-mono">.zip</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Renders every page at 2x DPI packed into a single ZIP file.
                  </p>
                </div>
              </div>

              {/* PDF to JPG */}
              <div
                onClick={() => handleExport("jpg")}
                className="p-4 rounded-xl border border-border bg-card/60 hover:bg-muted/60 cursor-pointer transition-all hover:border-pink-500/50 group flex items-start gap-3.5"
              >
                <div className="p-2.5 rounded-lg bg-pink-500/10 text-pink-600 shrink-0 group-hover:scale-105 transition-transform">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                    PDF to JPG Images
                    <span className="text-[10px] px-1.5 py-0.2 bg-pink-100 text-pink-700 rounded-sm font-mono">.zip</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Lightweight image export with compressed JPEG quality.
                  </p>
                </div>
              </div>

              {/* PDF to Plain Text */}
              <div
                onClick={() => handleExport("txt")}
                className="p-4 rounded-xl border border-border bg-card/60 hover:bg-muted/60 cursor-pointer transition-all hover:border-cyan-500/50 group flex items-start gap-3.5"
              >
                <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-600 shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                    PDF to Plain Text
                    <span className="text-[10px] px-1.5 py-0.2 bg-cyan-100 text-cyan-700 rounded-sm font-mono">.txt</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Clean text extraction stripped of formatting for raw copying.
                  </p>
                </div>
              </div>

              {/* PDF to HTML */}
              <div
                onClick={() => handleExport("html")}
                className="p-4 rounded-xl border border-border bg-card/60 hover:bg-muted/60 cursor-pointer transition-all hover:border-indigo-500/50 group flex items-start gap-3.5"
              >
                <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-600 shrink-0 group-hover:scale-105 transition-transform">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                    PDF to HTML Webpage
                    <span className="text-[10px] px-1.5 py-0.2 bg-indigo-100 text-indigo-700 rounded-sm font-mono">.html</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Standalone HTML file with page frames and styled typography.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Images to PDF */}
              <div
                onClick={() => imagesInputRef.current?.click()}
                className="p-4 rounded-xl border border-border bg-card/60 hover:bg-muted/60 cursor-pointer transition-all hover:border-primary/50 group flex items-start gap-3.5"
              >
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0 group-hover:scale-105 transition-transform">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-xs text-foreground flex items-center gap-2">
                    Images to PDF (Compile Multiple)
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Select JPG, PNG, or WebP pictures to combine into a multi-page PDF document.
                  </p>
                </div>
              </div>

              {/* Word to PDF */}
              <div
                onClick={() => wordInputRef.current?.click()}
                className="p-4 rounded-xl border border-border bg-card/60 hover:bg-muted/60 cursor-pointer transition-all hover:border-blue-500/50 group flex items-start gap-3.5"
              >
                <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-xs text-foreground flex items-center gap-2">
                    Word (.docx) to PDF
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Imports Microsoft Word document, extracts structure, and renders into a clean PDF.
                  </p>
                </div>
              </div>

              {/* Excel to PDF */}
              <div
                onClick={() => excelInputRef.current?.click()}
                className="p-4 rounded-xl border border-border bg-card/60 hover:bg-muted/60 cursor-pointer transition-all hover:border-emerald-500/50 group flex items-start gap-3.5"
              >
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0 group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-xs text-foreground flex items-center gap-2">
                    Excel / Spreadsheet to PDF
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Parses CSV / spreadsheet data and renders into landscape formatted PDF tables.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hidden inputs */}
        <input
          ref={imagesInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          onChange={handleImagesUpload}
          className="hidden"
        />
        <input
          ref={wordInputRef}
          type="file"
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleWordUpload}
          className="hidden"
        />
        <input
          ref={excelInputRef}
          type="file"
          accept=".csv,.tsv,text/csv,text/plain"
          onChange={handleExcelUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};
