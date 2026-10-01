"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload,
  Sparkles,
  ShieldCheck,
  FileText,
  Layers,
  Highlighter,
  FileSignature,
  Stamp,
  Type,
  ChevronLeft,
  ChevronRight,
  Sliders,
} from "lucide-react";
import { usePdfEditorStore } from "./store";
import {
  loadPdfDocument,
  createDemoPdf,
  mergePdfs,
  extractPagesAsPdf,
  exportComments,
  parseExistingFormFields,
  exportFormDataToJson,
  exportFormDataToFdf,
} from "./logic";
import { exportPdfDocument } from "./exportPdf";
import { HeaderBar } from "./ui/HeaderBar";
import { ModeTabs } from "./ui/ModeTabs";
import { Toolbar } from "./ui/Toolbar";
import { ThumbnailSidebar } from "./ui/ThumbnailSidebar";
import { PageCanvas } from "./ui/PageCanvas";
import { PropertiesSidebar } from "./ui/PropertiesSidebar";
import { SignatureModal } from "./ui/SignatureModal";
import { SearchRedactModal } from "./ui/SearchRedactModal";
import { SecurityModal } from "./ui/SecurityModal";
import { ConvertModal } from "./ui/ConvertModal";
import { OcrModal } from "./ui/OcrModal";
import { CompareModal } from "./ui/CompareModal";
import { FindReplaceModal } from "./ui/FindReplaceModal";
import { MobileToolbar } from "./ui/MobileToolbar";
import { ContentElement, AnnotationObject } from "./types";

export default function PdfEditor() {
  const {
    pdfBytes,
    fileName,
    pages,
    activePageIndex,
    setDocument,
    resetDocument,
    annotations,
    elements,
    formFields,
    redactions,
    metadata,
    security,
    isFlattened,
    watermark,
    pageNumbering,
    bates,
    headerFooter,
    pageBackground,
    addElement,
    addAnnotation,
    addRedaction,
    setFormFields,
    importFormData,
    flattenDocument,
    insertBlankPage,
    insertPages,
    undo,
    redo,
    selectObject,
    deleteAnnotation,
    deleteElement,
    deleteFormField,
    deleteRedaction,
    selectedObjectId,
    selectedObjectType,
  } = usePdfEditorStore();

  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [rawPdfDoc, setRawPdfDoc] = useState<any>(null);

  // Layout toggles
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(true);

  // Active Drawing / Styling State
  const [activeColor, setActiveColor] = useState("#eab308");
  const [activeStrokeWidth, setActiveStrokeWidth] = useState(2);

  // Modals & Hidden File Pickers
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [signatureInitialTab, setSignatureInitialTab] = useState<"draw" | "type" | "upload" | "initials">("draw");
  const [isSearchRedactOpen, setIsSearchRedactOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isFindReplaceModalOpen, setIsFindReplaceModalOpen] = useState(false);

  const openFileInputRef = useRef<HTMLInputElement | null>(null);
  const mergeFileInputRef = useRef<HTMLInputElement | null>(null);
  const imageFileInputRef = useRef<HTMLInputElement | null>(null);
  const jsonFileInputRef = useRef<HTMLInputElement | null>(null);

  // Load a PDF file from buffer
  const handleLoadPdf = async (file: File | Uint8Array, name: string) => {
    setIsLoadingDoc(true);
    try {
      let buffer: Uint8Array;
      let size = 0;
      if (file instanceof File) {
        const arrayBuf = await file.arrayBuffer();
        buffer = new Uint8Array(arrayBuf);
        size = file.size;
      } else {
        buffer = file;
      }

      const { pages: extractedPages, rawPdf } = await loadPdfDocument(buffer);
      setRawPdfDoc(rawPdf);
      setDocument(buffer, name, size, extractedPages);

      // Auto-extract existing AcroForm fields
      try {
        const existingFields = await parseExistingFormFields(buffer);
        if (existingFields && existingFields.length > 0) {
          setFormFields(existingFields);
        }
      } catch (err) {
        console.warn("Could not parse existing AcroForms:", err);
      }
    } catch (err) {
      console.error("Error loading PDF:", err);
      alert("Failed to load PDF file. Please ensure it is a valid PDF document.");
    } finally {
      setIsLoadingDoc(false);
    }
  };

  // Load Demo Contract
  const handleLoadDemo = async () => {
    setIsLoadingDoc(true);
    try {
      const { bytes, fileName: demoName } = await createDemoPdf();
      await handleLoadPdf(bytes, demoName);
    } catch (err) {
      console.error("Error generating demo PDF:", err);
    } finally {
      setIsLoadingDoc(false);
    }
  };

  // Export PDF Document
  const handleExport = async () => {
    if (!pdfBytes || pages.length === 0) return;
    setIsExporting(true);
    try {
      const outputBytes = await exportPdfDocument({
        sourcePdfBytes: pdfBytes,
        pages,
        annotations,
        elements,
        formFields,
        redactions,
        metadata,
        security,
        isFlattened,
        watermark,
        pageNumbering,
        bates,
        headerFooter,
        pageBackground,
      });

      const blob = new Blob([outputBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const baseName = fileName.replace(/\.[^/.]+$/, "");
      link.href = url;
      link.download = `${baseName}-edited.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export PDF. Please check your changes.");
    } finally {
      setIsExporting(false);
    }
  };

  // Handle JSON Form Data Import
  const handleJsonImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === "object") {
          importFormData(parsed);
          alert("Form data imported successfully!");
        }
      } catch (err) {
        console.error("Failed to parse JSON form data:", err);
        alert("Failed to parse JSON form data. Please check file format.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Handle Drag & Drop on Welcome Screen
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") {
      handleLoadPdf(file, file.name);
    }
  };

  // Handle File Input Change (New File)
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleLoadPdf(file, file.name);
    }
  };

  // Handle File Input Change (Merge File)
  const handleMergeFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pdfBytes) return;

    try {
      const fileBytes = new Uint8Array(await file.arrayBuffer());
      const { bytes: mergedBytes, addedCount } = await mergePdfs(pdfBytes, fileBytes, activePageIndex);
      const { pages: updatedPages, rawPdf } = await loadPdfDocument(mergedBytes);
      setRawPdfDoc(rawPdf);
      setDocument(mergedBytes, fileName, mergedBytes.byteLength, updatedPages);
    } catch (err) {
      console.error("Merge error:", err);
      alert("Failed to merge PDF document.");
    }
  };

  // Handle Image Upload Insertion
  const handleImageFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const aspect = img.width / img.height;
        const width = 160;
        const height = width / aspect;

        const newImgElement: ContentElement = {
          id: `img-${Date.now()}`,
          type: "image",
          pageIndex: activePageIndex,
          x: 100,
          y: 100,
          width,
          height,
          imageDataUrl: dataUrl,
        };
        addElement(newImgElement);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Extract Pages
  const handleExtractPages = async () => {
    if (!pdfBytes) return;
    const pageNum = prompt(`Enter page numbers to extract (e.g. 1, 2-3):`, `${activePageIndex + 1}`);
    if (!pageNum) return;

    // Parse simple ranges
    const indices: number[] = [];
    const parts = pageNum.split(",");
    parts.forEach((p) => {
      if (p.includes("-")) {
        const [startStr, endStr] = p.split("-");
        const start = parseInt((startStr || "").trim(), 10);
        const end = parseInt((endStr || "").trim(), 10);
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= pages.length) indices.push(i - 1);
          }
        }
      } else {
        const n = parseInt(p.trim(), 10);
        if (!isNaN(n) && n >= 1 && n <= pages.length) indices.push(n - 1);
      }
    });

    if (indices.length === 0) {
      alert("Invalid page range specified.");
      return;
    }

    try {
      const extractedBytes = await extractPagesAsPdf(pdfBytes, indices);
      const blob = new Blob([extractedBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileName.replace(/\.pdf$/i, "")}-extracted.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Extract error:", err);
      alert("Failed to extract pages.");
    }
  };

  // Add Stamp
  const handleAddStamp = (text: string, color: string) => {
    const newStamp: AnnotationObject = {
      id: `stamp-${Date.now()}`,
      type: "stamp",
      pageIndex: activePageIndex,
      x: 150,
      y: 150,
      width: 140,
      height: 40,
      color,
      opacity: 0.9,
      strokeWidth: 2,
      text,
      createdAt: new Date().toLocaleDateString(),
    };
    addAnnotation(newStamp);
  };

  // Add Today's Date
  const handleAddDate = () => {
    const newDateElement: ContentElement = {
      id: `date-${Date.now()}`,
      type: "date",
      pageIndex: activePageIndex,
      x: 120,
      y: 120,
      width: 110,
      height: 24,
      text: new Date().toISOString().split("T")[0],
      fontSize: 12,
      color: "#000000",
    };
    addElement(newDateElement);
  };

  // Signature Applied Callback
  const handleApplySignature = (dataUrl: string, type: "signature" | "initials") => {
    const isInitials = type === "initials";
    const width = isInitials ? 80 : 180;
    const height = isInitials ? 50 : 65;

    const newSigElement: ContentElement = {
      id: `sig-${Date.now()}`,
      type,
      pageIndex: activePageIndex,
      x: 140,
      y: 200,
      width,
      height,
      imageDataUrl: dataUrl,
    };
    addElement(newSigElement);
  };

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input or textarea
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedObjectId) {
          e.preventDefault();
          if (selectedObjectType === "annotation") {
            deleteAnnotation(selectedObjectId);
          } else if (selectedObjectType === "element") {
            deleteElement(selectedObjectId);
          } else if (selectedObjectType === "formField") {
            deleteFormField(selectedObjectId);
          } else if (selectedObjectType === "redaction") {
            deleteRedaction(selectedObjectId);
          }
        }
      } else if (e.key === "Escape") {
        selectObject(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    undo,
    redo,
    selectedObjectId,
    selectedObjectType,
    deleteAnnotation,
    deleteElement,
    deleteFormField,
    deleteRedaction,
    selectObject,
  ]);

  // WELCOME / DROPZONE SCREEN
  if (!pdfBytes || pages.length === 0) {
    return (
      <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center p-6 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-2xl w-full text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Client-Side In-Memory PDF Workspace</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Professional PDF Editor
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
              Organize, annotate, sign, redact, and stamp PDF documents entirely in your web browser. Zero server uploads, zero data leaks.
            </p>
          </div>

          {/* Drag & Drop Card */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => openFileInputRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-primary/80 bg-card/60 hover:bg-card/90 rounded-2xl p-10 cursor-pointer transition-all shadow-sm hover:shadow-md group relative overflow-hidden"
          >
            {isLoadingDoc ? (
              <div className="py-8 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                <span className="text-sm font-medium text-foreground">
                  Parsing PDF pages in browser memory...
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-foreground">
                    Click to select or drag and drop your PDF here
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Supports documents of any size. Never transmitted to external servers.
                  </p>
                </div>
                <button
                  type="button"
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-sm hover:bg-primary/90 transition-colors"
                >
                  Choose PDF File
                </button>
              </div>
            )}
          </div>

          {/* Quick Demo Contract Button */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <span className="text-xs text-muted-foreground">Or test immediately:</span>
            <button
              onClick={handleLoadDemo}
              disabled={isLoadingDoc}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Load Sample 3-Page Agreement</span>
            </button>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 text-left">
            <div className="p-3.5 rounded-xl border border-border/60 bg-card/40">
              <Layers className="w-4 h-4 text-blue-500 mb-1.5" />
              <h4 className="text-xs font-semibold text-foreground">Organize Pages</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">Reorder, rotate, split, merge, crop, and duplicate.</p>
            </div>
            <div className="p-3.5 rounded-xl border border-border/60 bg-card/40">
              <Highlighter className="w-4 h-4 text-amber-500 mb-1.5" />
              <h4 className="text-xs font-semibold text-foreground">Annotate</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">Highlight, underline, sticky notes, shapes, and freehand pen.</p>
            </div>
            <div className="p-3.5 rounded-xl border border-border/60 bg-card/40">
              <FileSignature className="w-4 h-4 text-emerald-500 mb-1.5" />
              <h4 className="text-xs font-semibold text-foreground">Fill & Sign</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">Draw, type cursive, or upload transparent digital signatures.</p>
            </div>
            <div className="p-3.5 rounded-xl border border-border/60 bg-card/40">
              <Stamp className="w-4 h-4 text-purple-500 mb-1.5" />
              <h4 className="text-xs font-semibold text-foreground">Stamp & Redact</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">Watermarks, Bates numbering, page numbers, and whiteout.</p>
            </div>
          </div>
        </div>

        {/* Hidden inputs */}
        <input
          ref={openFileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>
    );
  }

  // WORKSPACE VIEW
  return (
    <div className="flex flex-col h-[calc(100vh-65px)] bg-background select-none overflow-hidden">
      {/* 1. Top Header Bar */}
      <HeaderBar
        onExport={handleExport}
        onLoadDemo={handleLoadDemo}
        onOpenNewFile={() => openFileInputRef.current?.click()}
        isExporting={isExporting}
      />

      {/* 2. Mode Selector Bar */}
      <ModeTabs />

      {/* 3. Contextual Tool Bar */}
      <Toolbar
        onOpenSignatureModal={(tab) => {
          setSignatureInitialTab(tab);
          setIsSignatureModalOpen(true);
        }}
        onInsertImageClick={() => imageFileInputRef.current?.click()}
        onMergeFileClick={() => mergeFileInputRef.current?.click()}
        onExtractPagesClick={handleExtractPages}
        onOpenSearchRedact={() => setIsSearchRedactOpen(true)}
        onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
        onOpenConvertModal={() => setIsConvertModalOpen(true)}
        onOpenOcrModal={() => setIsOcrModalOpen(true)}
        onOpenCompareModal={() => setIsCompareModalOpen(true)}
        onOpenFindReplaceModal={() => setIsFindReplaceModalOpen(true)}
        onExportFormData={(format) => {
          if (format === "json") {
            exportFormDataToJson(formFields, fileName);
          } else {
            exportFormDataToFdf(formFields, fileName);
          }
        }}
        onImportFormDataClick={() => jsonFileInputRef.current?.click()}
        onFlattenClick={(target) => flattenDocument(target)}
        activeColor={activeColor}
        onChangeColor={setActiveColor}
        activeStrokeWidth={activeStrokeWidth}
        onChangeStrokeWidth={setActiveStrokeWidth}
        onAddStamp={handleAddStamp}
        onAddDate={handleAddDate}
      />

      {/* 4. Main 3-Pane Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Thumbnail Sidebar */}
        {isSidebarOpen && (
          <ThumbnailSidebar
            onInsertBlank={() => insertBlankPage(activePageIndex)}
            onInsertFromFile={() => mergeFileInputRef.current?.click()}
            onExtractPages={handleExtractPages}
          />
        )}

        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-1 rounded-r-md bg-card border-y border-r border-border shadow-xs text-muted-foreground hover:text-foreground hidden sm:block"
          style={{ left: isSidebarOpen ? "14rem" : "0" }}
          title={isSidebarOpen ? "Hide Pages Sidebar" : "Show Pages Sidebar"}
        >
          {isSidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {/* Center: Interactive Page Canvas */}
        <PageCanvas
          rawPdfDoc={rawPdfDoc}
          activeColor={activeColor}
          activeStrokeWidth={activeStrokeWidth}
        />

        {/* Right: Properties & Stamping Sidebar */}
        {isPropertiesOpen && (
          <PropertiesSidebar
            onExportComments={(format) => exportComments(annotations, format, fileName)}
          />
        )}

        {/* Properties Toggle Button */}
        <button
          onClick={() => setIsPropertiesOpen(!isPropertiesOpen)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-1 rounded-l-md bg-card border-y border-l border-border shadow-xs text-muted-foreground hover:text-foreground hidden sm:block"
          style={{ right: isPropertiesOpen ? "18rem" : "0" }}
          title={isPropertiesOpen ? "Hide Properties Sidebar" : "Show Properties Sidebar"}
        >
          {isPropertiesOpen ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 5. Mobile Bottom Toolbar */}
      <MobileToolbar onExport={handleExport} isExporting={isExporting} />

      {/* Signature Modal */}
      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onApplySignature={handleApplySignature}
        initialTab={signatureInitialTab}
      />

      {/* Search & Redact Modal */}
      <SearchRedactModal
        isOpen={isSearchRedactOpen}
        onClose={() => setIsSearchRedactOpen(false)}
        rawPdfDoc={rawPdfDoc}
        onApplyRedactionMatches={(matches) => {
          matches.forEach((m) => addRedaction(m));
        }}
      />

      {/* Security & Permissions Modal */}
      <SecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />

      {/* Tier 3: Document Format Conversion Modal */}
      <ConvertModal
        isOpen={isConvertModalOpen}
        onClose={() => setIsConvertModalOpen(false)}
        rawPdfDoc={rawPdfDoc}
        fileName={fileName}
        onLoadNewPdf={(bytes, name) => handleLoadPdf(bytes, name)}
      />

      {/* Tier 3: OCR Text Recognition & Searchable PDF Modal */}
      <OcrModal
        isOpen={isOcrModalOpen}
        onClose={() => setIsOcrModalOpen(false)}
        rawPdfDoc={rawPdfDoc}
      />

      {/* Tier 3: Visual PDF Comparison Modal */}
      <CompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        rawPdfDocA={rawPdfDoc}
        fileNameA={fileName}
      />

      {/* Tier 3: Find & Replace Text Modal */}
      <FindReplaceModal
        isOpen={isFindReplaceModalOpen}
        onClose={() => setIsFindReplaceModalOpen(false)}
        rawPdfDoc={rawPdfDoc}
      />

      {/* Hidden File Input for Opening New PDF */}
      <input
        ref={openFileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Hidden File Input for Merging PDF */}
      <input
        ref={mergeFileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleMergeFileInputChange}
        className="hidden"
      />

      {/* Hidden File Input for Image Upload */}
      <input
        ref={imageFileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleImageFileInputChange}
        className="hidden"
      />

      {/* Hidden File Input for Form Data JSON Import */}
      <input
        ref={jsonFileInputRef}
        type="file"
        accept="application/json"
        onChange={handleJsonImportChange}
        className="hidden"
      />
    </div>
  );
}
