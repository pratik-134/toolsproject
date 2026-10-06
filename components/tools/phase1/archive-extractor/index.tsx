"use client";

import React, { useState, useMemo, useRef } from "react";
import { zipSync, strToU8 } from "fflate";
import {
  extractArchive,
  ArchiveMetadata,
  ExtractedFile,
  formatFileSize,
  readTextContent,
} from "./logic";
import {
  Archive,
  FileText,
  FileCode,
  Image as ImageIcon,
  File,
  Folder,
  Download,
  Upload,
  Search,
  Eye,
  Trash2,
  ShieldCheck,
  PackageCheck,
  Check,
  X,
} from "lucide-react";

const SAMPLE_PRESETS: { name: string; files: Record<string, string> }[] = [
  {
    name: "Web Starter Pack (.zip)",
    files: {
      "index.html": "<!DOCTYPE html>\n<html>\n<head>\n  <title>Qwertygen Starter</title>\n  <link rel=\"stylesheet\" href=\"styles.css\">\n</head>\n<body>\n  <h1>Welcome to Qwertygen</h1>\n  <p>Zero-upload client-side tools.</p>\n</body>\n</html>",
      "styles.css": "body {\n  font-family: sans-serif;\n  background: #0f172a;\n  color: #f8fafc;\n  padding: 2rem;\n}\nh1 {\n  color: #38bdf8;\n}",
      "app.js": "console.log('Qwertygen Web Starter initialized successfully!');",
      "README.md": "# Web Starter Pack\nThis is a sample project bundle extracted entirely in browser memory.",
      "config/app.json": JSON.stringify({ name: "qwertygen-starter", version: "1.0.0", private: true }, null, 2),
    },
  },
  {
    name: "Markdown Docs Bundle (.zip)",
    files: {
      "docs/overview.md": "# System Overview\nQwertygen is designed for privacy-first, client-side utility computing.",
      "docs/architecture.md": "# Architecture Invariants\n1. Zero server uploads\n2. 100% in-memory processing\n3. Strict CSP",
      "docs/changelog.md": "# Changelog\n- Added archive extractor\n- Added archive packer\n- Fully verified",
      "LICENSE": "MIT License\nCopyright (c) 2026 Qwertygen",
    },
  },
];

export default function ArchiveExtractorTool() {
  const [archiveMeta, setArchiveMeta] = useState<ArchiveMetadata | null>(() => {
    // Initialize with first preset
    const preset = SAMPLE_PRESETS[0]!;
    const binaryFiles: Record<string, Uint8Array> = {};
    for (const [path, content] of Object.entries(preset.files)) {
      binaryFiles[path] = strToU8(content);
    }
    const zipBuf = zipSync(binaryFiles);
    return extractArchive(zipBuf);
  });

  const [fileName, setFileName] = useState<string>("web_starter_bundle.zip");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [previewFile, setPreviewFile] = useState<ExtractedFile | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredFiles = useMemo(() => {
    if (!archiveMeta) return [];
    if (!searchQuery.trim()) return archiveMeta.files;
    const q = searchQuery.toLowerCase();
    return archiveMeta.files.filter((f) => f.path.toLowerCase().includes(q));
  }, [archiveMeta, searchQuery]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert("File exceeds 50MB browser extraction limit.");
      return;
    }

    setIsProcessing(true);
    setFileName(file.name);
    setPreviewFile(null);

    try {
      const buffer = await file.arrayBuffer();
      const meta = extractArchive(buffer);
      setArchiveMeta(meta);
    } catch (err) {
      alert(`Failed to extract archive: ${(err as Error).message}`);
    } finally {
      setIsProcessing(false);
      e.target.value = "";
    }
  };

  const handleLoadPreset = (preset: (typeof SAMPLE_PRESETS)[0]) => {
    const binaryFiles: Record<string, Uint8Array> = {};
    for (const [path, content] of Object.entries(preset.files)) {
      binaryFiles[path] = strToU8(content);
    }
    const zipBuf = zipSync(binaryFiles);
    const meta = extractArchive(zipBuf);
    setArchiveMeta(meta);
    setFileName(`${preset.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}.zip`);
    setPreviewFile(null);
  };

  const handleDownloadSingle = (file: ExtractedFile) => {
    const blob = new Blob([file.data as unknown as BlobPart], { type: file.mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    if (!archiveMeta) return;
    archiveMeta.files
      .filter((f) => !f.isDirectory)
      .forEach((f, idx) => {
        setTimeout(() => handleDownloadSingle(f), idx * 150);
      });
  };

  const renderFileIcon = (file: ExtractedFile) => {
    if (file.isDirectory) return <Folder className="w-4 h-4 text-amber-500" />;
    if (file.isImage) return <ImageIcon className="w-4 h-4 text-purple-500" />;
    if (file.isText && (file.name.endsWith(".js") || file.name.endsWith(".ts") || file.name.endsWith(".json") || file.name.endsWith(".html") || file.name.endsWith(".css"))) {
      return <FileCode className="w-4 h-4 text-blue-500" />;
    }
    if (file.isText) return <FileText className="w-4 h-4 text-emerald-500" />;
    return <File className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Top Header: Presets & File Upload */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
            Presets:
          </span>
          {SAMPLE_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => handleLoadPreset(p)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-slate-700 hover:text-blue-700 transition"
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".zip,.tar,.gz,.tgz"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            Upload Archive (.zip, .tar, .gz)
          </button>
          <button
            onClick={() => {
              setArchiveMeta(null);
              setPreviewFile(null);
              setFileName("Empty");
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-700 transition shadow-2xs"
            title="Clear archive"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Top: File Explorer */}
        <div className={`${previewFile ? "lg:col-span-7" : "lg:col-span-12"} bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4`}>
          {archiveMeta ? (
            <>
              {/* Archive Metadata Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-50 rounded-xl border border-blue-100">
                    <Archive className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{fileName}</div>
                    <div className="text-xs text-slate-500 font-medium">
                      {archiveMeta.totalFiles} files &bull; {formatFileSize(archiveMeta.uncompressedSize)} uncompressed
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-lg bg-slate-100 text-slate-700">
                    {archiveMeta.format}
                  </span>
                  {archiveMeta.compressionRatio > 0 && (
                    <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {archiveMeta.compressionRatio}% compressed
                    </span>
                  )}
                  <button
                    onClick={handleDownloadAll}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    Extract All
                  </button>
                </div>
              </div>

              {/* Search Filter */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter files by path or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Files Table / List */}
              <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                {filteredFiles.map((file) => (
                  <div
                    key={file.path}
                    className={`flex items-center justify-between p-2.5 text-xs transition ${
                      previewFile?.path === file.path ? "bg-blue-50/70" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      {renderFileIcon(file)}
                      <span className="font-mono text-slate-800 truncate" title={file.path}>
                        {file.path}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {file.isDirectory ? "DIR" : formatFileSize(file.size)}
                      </span>

                      {!file.isDirectory && (file.isText || file.isImage) && (
                        <button
                          onClick={() => setPreviewFile(file)}
                          className="p-1 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-100/50 transition"
                          title="Preview file content"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {!file.isDirectory && (
                        <button
                          onClick={() => handleDownloadSingle(file)}
                          className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 transition"
                          title="Download single file"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-sm text-slate-500">
              No archive loaded. Upload a .zip, .tar, or .gz file to inspect its contents.
            </div>
          )}

          {/* Privacy Invariant Banner */}
          <div className="p-3 bg-emerald-50/80 border border-emerald-200/60 rounded-xl flex gap-2 items-center text-xs text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>100% In-Browser Decompression:</strong> Your archives are extracted locally in browser RAM. Zero files are uploaded to any server.
            </span>
          </div>
        </div>

        {/* Right: File Previewer Drawer (when file selected) */}
        {previewFile && (
          <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                {renderFileIcon(previewFile)}
                <span className="text-xs font-bold text-slate-900 truncate font-mono">
                  {previewFile.name}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {previewFile.isText && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(readTextContent(previewFile));
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="p-1 text-slate-500 hover:text-blue-600 transition"
                    title="Copy text"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                )}
                <button
                  onClick={() => handleDownloadSingle(previewFile)}
                  className="p-1 text-slate-500 hover:text-slate-900 transition"
                  title="Download file"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 transition"
                  title="Close preview"
                  aria-label="Close preview"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Preview content rendering */}
            {previewFile.isImage ? (
              <div className="flex items-center justify-center p-4 bg-slate-100 rounded-xl max-h-80 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(new Blob([previewFile.data as unknown as BlobPart], { type: previewFile.mimeType }))}
                  alt={previewFile.name}
                  className="max-h-72 object-contain rounded-lg"
                />
              </div>
            ) : previewFile.isText ? (
              <textarea
                readOnly
                value={readTextContent(previewFile)}
                className="w-full h-80 px-3 py-2 text-xs font-mono text-slate-900 bg-slate-50 border border-slate-200 rounded-xl resize-y outline-hidden"
                spellCheck={false}
              />
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                Binary file preview is not supported. Click Download to save this file.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
