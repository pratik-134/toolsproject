"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  FileItem,
  CompressionLevel,
  packZipArchive,
  createFileItem,
  formatBytes,
} from "./logic";
import {
  PackagePlus,
  FileText,
  FileCode,
  FolderPlus,
  Upload,
  Download,
  Trash2,
  Settings,
  ShieldCheck,
  Check,
  Plus,
} from "lucide-react";

interface Preset {
  name: string;
  files: { path: string; content: string }[];
}

const PRESETS: Preset[] = [
  {
    name: "Web Starter Bundle",
    files: [
      {
        path: "index.html",
        content: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Cleartrix Starter</title>\n  <link rel=\"stylesheet\" href=\"styles.css\">\n</head>\n<body>\n  <h1>Cleartrix Web Starter</h1>\n  <script src=\"app.js\"></script>\n</body>\n</html>",
      },
      {
        path: "styles.css",
        content: "body {\n  font-family: system-ui, sans-serif;\n  background: #0f172a;\n  color: #fff;\n  margin: 2rem;\n}",
      },
      {
        path: "app.js",
        content: "console.log('App ready!');",
      },
      {
        path: "package.json",
        content: JSON.stringify({ name: "cleartrix-starter", version: "1.0.0", private: true }, null, 2),
      },
      {
        path: "README.md",
        content: "# Cleartrix Web Starter\nPackaged with 100% in-browser privacy.",
      },
    ],
  },
  {
    name: "Dev Configs Pack",
    files: [
      {
        path: ".env.example",
        content: "PORT=3000\nNODE_ENV=production\nDATABASE_URL=postgresql://localhost:5432/db",
      },
      {
        path: "tsconfig.json",
        content: JSON.stringify({ compilerOptions: { target: "ES2022", strict: true } }, null, 2),
      },
      {
        path: ".gitignore",
        content: "node_modules/\n.env\ndist/\n.next/\n",
      },
    ],
  },
];

export default function ArchivePackerTool() {
  const [files, setFiles] = useState<FileItem[]>(() => {
    const preset = PRESETS[0]!;
    return preset.files.map((f) => createFileItem(f.path, f.content));
  });

  const [archiveName, setArchiveName] = useState<string>("cleartrix-archive.zip");
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>(6);
  const [newFilePath, setNewFilePath] = useState<string>("");
  const [newFileContent, setNewFileContent] = useState<string>("");
  const [isAddingFile, setIsAddingFile] = useState<boolean>(false);
  const [isPacking, setIsPacking] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const packSummary = useMemo(() => {
    try {
      return packZipArchive(files, { level: compressionLevel });
    } catch {
      return null;
    }
  }, [files, compressionLevel]);

  const processIncomingFiles = async (uploadedFiles: FileList | File[]) => {
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    const fileList = Array.from(uploadedFiles);
    const newItems: FileItem[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file) continue;

      if (file.size > 25 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 25MB individual limit.`);
        continue;
      }

      const buffer = await file.arrayBuffer();
      newItems.push({
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        path: file.name,
        data: new Uint8Array(buffer),
        size: file.size,
      });
    }

    setFiles((prev) => [...prev, ...newItems]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await processIncomingFiles(e.target.files);
    }
  };

  const handleCreateNewFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilePath.trim()) return;

    const newItem = createFileItem(newFilePath.trim(), newFileContent);
    setFiles((prev) => [...prev, newItem]);
    setNewFilePath("");
    setNewFileContent("");
    setIsAddingFile(false);
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDownloadZip = () => {
    if (!packSummary) return;

    setIsPacking(true);
    try {
      const blob = new Blob([packSummary.zipData as unknown as BlobPart], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = archiveName.endsWith(".zip") ? archiveName : `${archiveName}.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsPacking(false);
    }
  };

  const handleLoadPreset = (preset: Preset) => {
    setFiles(preset.files.map((f) => createFileItem(f.path, f.content)));
    setArchiveName(`${preset.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.zip`);
  };

  return (
    <div className="space-y-6">
      {/* Top Presets & Actions Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
            Presets:
          </span>
          {PRESETS.map((p) => (
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
            multiple
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            Upload Files
          </button>
          <button
            onClick={() => setIsAddingFile(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            New Text File
          </button>
          <button
            onClick={() => setFiles([])}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-700 transition shadow-2xs"
            title="Clear all files"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Files Queue */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <PackagePlus className="w-4 h-4 text-emerald-600" />
              Files to Package ({files.length})
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Total: {formatBytes(files.reduce((acc, f) => acc + f.size, 0))}
            </span>
          </div>

          {/* Multi-File Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (e.dataTransfer.files?.length) {
                processIncomingFiles(e.dataTransfer.files);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-4 text-center cursor-pointer transition bg-slate-50/60 hover:bg-emerald-50/20"
          >
            <div className="flex items-center justify-center gap-2 text-slate-700 text-xs font-semibold">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Drag & drop multiple files here or click to browse</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports any file types. Select or drop multiple files simultaneously.
            </p>
          </div>

          {/* New File Inline Form */}
          {isAddingFile && (
            <form onSubmit={handleCreateNewFile} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800">Create New Text File</span>
                <button
                  type="button"
                  onClick={() => setIsAddingFile(false)}
                  className="text-xs text-slate-400 hover:text-slate-700"
                >
                  Cancel
                </button>
              </div>
              <input
                type="text"
                placeholder="File path (e.g. src/index.ts or docs/readme.md)"
                value={newFilePath}
                onChange={(e) => setNewFilePath(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 text-slate-900 bg-white focus:ring-2 focus:ring-blue-500"
                required
              />
              <textarea
                placeholder="Paste or write file contents here..."
                value={newFileContent}
                onChange={(e) => setNewFileContent(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Add File to Archive
              </button>
            </form>
          )}

          {/* Files List */}
          <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
            {files.length > 0 ? (
              files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-2.5 text-xs hover:bg-slate-50">
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <FileCode className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="font-mono text-slate-800 truncate" title={file.path}>
                      {file.path}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {formatBytes(file.size)}
                    </span>
                    <button
                      onClick={() => handleRemoveFile(file.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 transition"
                      title="Remove file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-sm text-slate-500">
                Queue is empty. Upload files or create text files above to build your archive.
              </div>
            )}
          </div>
        </div>

        {/* Right: Compression Settings & Action */}
        <div className="lg:col-span-5 space-y-5">
          {/* Settings Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4 text-slate-600" />
              ZIP Archive Settings
            </h3>

            {/* Archive Filename */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Archive Output Filename</label>
              <input
                type="text"
                value={archiveName}
                onChange={(e) => setArchiveName(e.target.value)}
                className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>

            {/* Compression Level */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Deflate Compression Level
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setCompressionLevel(0)}
                  className={`py-1.5 rounded-lg transition ${
                    compressionLevel === 0 ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                  }`}
                >
                  Store (0)
                </button>
                <button
                  type="button"
                  onClick={() => setCompressionLevel(1)}
                  className={`py-1.5 rounded-lg transition ${
                    compressionLevel === 1 ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                  }`}
                >
                  Fast (1)
                </button>
                <button
                  type="button"
                  onClick={() => setCompressionLevel(6)}
                  className={`py-1.5 rounded-lg transition ${
                    compressionLevel === 6 ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                  }`}
                >
                  Standard (6)
                </button>
                <button
                  type="button"
                  onClick={() => setCompressionLevel(9)}
                  className={`py-1.5 rounded-lg transition ${
                    compressionLevel === 9 ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                  }`}
                >
                  Maximum (9)
                </button>
              </div>
            </div>

            {/* Compression Summary Hero */}
            {packSummary && (
              <div className="p-4 bg-gradient-to-br from-emerald-50 via-teal-50/50 to-slate-50 border border-emerald-200/80 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600">Compressed Size:</span>
                  <span className="font-bold text-emerald-800 font-mono">
                    {formatBytes(packSummary.compressedSize)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600">Original Size:</span>
                  <span className="font-mono text-slate-500">
                    {formatBytes(packSummary.uncompressedSize)}
                  </span>
                </div>
                {packSummary.savingsPercent > 0 && (
                  <div className="flex justify-between items-center text-xs pt-1 border-t border-emerald-100">
                    <span className="font-semibold text-emerald-700">Space Saved:</span>
                    <span className="font-bold text-emerald-700 font-mono">
                      {packSummary.savingsPercent}% reduction
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Primary Action Button */}
            <button
              onClick={handleDownloadZip}
              disabled={files.length === 0 || isPacking}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Create &amp; Download ZIP Archive
            </button>
          </div>

          {/* Privacy Guarantee */}
          <div className="p-3 bg-emerald-50/80 border border-emerald-200/60 rounded-xl flex gap-2 items-center text-xs text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>100% In-Browser Compression:</strong> Archive packaging is computed entirely in your browser RAM using WebAssembly/JavaScript. Zero data is sent to external servers.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
