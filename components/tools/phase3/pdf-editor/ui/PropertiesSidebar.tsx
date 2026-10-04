import React, { useState } from "react";
import {
  Sliders,
  MessageSquare,
  Stamp,
  Trash2,
  FileDown,
  ExternalLink,
  Check,
  Type,
  Maximize2,
  Hash,
  Palette,
  Lock,
  ShieldCheck,
  FormInput,
  ShieldAlert,
} from "lucide-react";
import { usePdfEditorStore } from "../store";
import { exportComments } from "../logic";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PropertiesSidebarProps {
  onExportComments: (format: "txt" | "json") => void;
}

export const PropertiesSidebar: React.FC<PropertiesSidebarProps> = ({
  onExportComments,
}) => {
  const {
    pages,
    activePageIndex,
    selectedObjectId,
    selectedObjectType,
    annotations,
    elements,
    updateAnnotation,
    deleteAnnotation,
    updateElement,
    deleteElement,
    watermark,
    setWatermark,
    pageNumbering,
    setPageNumbering,
    bates,
    setBates,
    headerFooter,
    setHeaderFooter,
    pageBackground,
    setPageBackground,
    setActivePageIndex,
    selectObject,
    fileName,
    formFields,
    updateFormField,
    deleteFormField,
    redactions,
    updateRedaction,
    deleteRedaction,
    metadata,
    setMetadata,
    security,
    flattenDocument,
  } = usePdfEditorStore();

  const [activeTab, setActiveTab] = useState<"properties" | "comments" | "stamps" | "security">(
    selectedObjectId ? "properties" : "properties"
  );

  const selectedAnnotation =
    selectedObjectType === "annotation"
      ? annotations.find((a) => a.id === selectedObjectId)
      : null;

  const selectedElement =
    selectedObjectType === "element"
      ? elements.find((el) => el.id === selectedObjectId)
      : null;

  const selectedFormField =
    selectedObjectType === "formField"
      ? formFields.find((f) => f.id === selectedObjectId)
      : null;

  const selectedRedaction =
    selectedObjectType === "redaction"
      ? redactions.find((r) => r.id === selectedObjectId)
      : null;

  const currentPage = pages[activePageIndex];
  const allComments = annotations.filter((a) => a.type === "sticky-note" || a.comment);

  return (
    <aside className="w-72 border-l border-border bg-card/40 flex flex-col h-full select-none z-10 shrink-0 text-xs">
      {/* Tab Header */}
      <div className="h-10 px-2 border-b border-border flex items-center gap-1 bg-muted/20">
        <button
          onClick={() => setActiveTab("properties")}
          className={`flex-1 py-1.5 px-2 rounded-md font-medium text-center transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === "properties"
              ? "bg-background text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Inspect</span>
        </button>
        <button
          onClick={() => setActiveTab("comments")}
          className={`flex-1 py-1.5 px-2 rounded-md font-medium text-center transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === "comments"
              ? "bg-background text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Comments {allComments.length > 0 && `(${allComments.length})`}</span>
        </button>
        <button
          onClick={() => setActiveTab("stamps")}
          className={`flex-1 py-1.5 px-2 rounded-md font-medium text-center transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === "stamps"
              ? "bg-background text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Stamp className="w-3.5 h-3.5" />
          <span>Stamps</span>
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`flex-1 py-1.5 px-2 rounded-md font-medium text-center transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === "security"
              ? "bg-background text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Security</span>
        </button>
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* TAB 1: PROPERTIES */}
        {activeTab === "properties" && (
          <div>
            {selectedAnnotation ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="font-semibold text-foreground capitalize">
                    {selectedAnnotation.type.replace("-", " ")}
                  </span>
                  <button
                    onClick={() => deleteAnnotation(selectedAnnotation.id)}
                    className="p-1 rounded text-red-500 hover:bg-red-500/10"
                    title="Delete Annotation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Color & Opacity */}
                <div>
                  <label className="text-muted-foreground block mb-1">Color</label>
                  <input
                    type="color"
                    value={selectedAnnotation.color}
                    onChange={(e) => updateAnnotation(selectedAnnotation.id, { color: e.target.value })}
                    className="w-full h-8 rounded border border-border bg-background cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-muted-foreground mb-1">
                    <span>Opacity</span>
                    <span>{Math.round((selectedAnnotation.opacity ?? 1) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={selectedAnnotation.opacity ?? 1}
                    onChange={(e) =>
                      updateAnnotation(selectedAnnotation.id, { opacity: parseFloat(e.target.value) })
                    }
                    className="w-full accent-primary"
                  />
                </div>

                {/* Stroke Width */}
                <div>
                  <div className="flex justify-between text-muted-foreground mb-1">
                    <span>Stroke Width</span>
                    <span>{selectedAnnotation.strokeWidth || 1}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    step="1"
                    value={selectedAnnotation.strokeWidth || 1}
                    onChange={(e) =>
                      updateAnnotation(selectedAnnotation.id, { strokeWidth: parseInt(e.target.value) })
                    }
                    className="w-full accent-primary"
                  />
                </div>

                {/* Text or Comment note */}
                {selectedAnnotation.type === "sticky-note" && (
                  <div>
                    <label className="text-muted-foreground block mb-1">Note Content</label>
                    <textarea
                      rows={3}
                      value={selectedAnnotation.text || ""}
                      onChange={(e) => updateAnnotation(selectedAnnotation.id, { text: e.target.value })}
                      placeholder="Type your comment..."
                      className="w-full p-2 rounded border border-border bg-background text-foreground"
                    />
                  </div>
                )}
              </div>
            ) : selectedElement ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="font-semibold text-foreground capitalize">
                    {selectedElement.type} Element
                  </span>
                  <button
                    onClick={() => deleteElement(selectedElement.id)}
                    className="p-1 rounded text-red-500 hover:bg-red-500/10"
                    title="Delete Element"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Text Content */}
                {(selectedElement.type === "text" || selectedElement.type === "link") && (
                  <div>
                    <label className="text-muted-foreground block mb-1">Text</label>
                    <textarea
                      rows={2}
                      value={selectedElement.text || ""}
                      onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })}
                      className="w-full p-2 rounded border border-border bg-background text-foreground"
                    />
                  </div>
                )}

                {/* Font Family & Size */}
                {selectedElement.type === "text" && (
                  <>
                    <div>
                      <label className="text-muted-foreground block mb-1">Font Family</label>
                      <Select
                        value={selectedElement.fontFamily || "Helvetica"}
                        onValueChange={(val) =>
                          updateElement(selectedElement.id, {
                            fontFamily: val as any,
                          })
                        }
                      >
                        <SelectTrigger className="w-full h-8 text-xs bg-background border-border">
                          <SelectValue placeholder="Font family" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Helvetica">Helvetica (Standard Sans)</SelectItem>
                          <SelectItem value="Helvetica-Bold">Helvetica Bold</SelectItem>
                          <SelectItem value="Times-Roman">Times New Roman (Serif)</SelectItem>
                          <SelectItem value="Courier">Courier (Monospace)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <div className="flex justify-between text-muted-foreground mb-1">
                        <span>Font Size</span>
                        <span>{selectedElement.fontSize || 12}pt</span>
                      </div>
                      <input
                        type="range"
                        min="8"
                        max="48"
                        step="1"
                        value={selectedElement.fontSize || 12}
                        onChange={(e) =>
                          updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })
                        }
                        className="w-full accent-primary"
                      />
                    </div>
                  </>
                )}

                {/* Link URL */}
                {selectedElement.type === "link" && (
                  <div>
                    <label className="text-muted-foreground block mb-1">Destination URL</label>
                    <input
                      type="url"
                      placeholder="https://example.com"
                      value={selectedElement.url || ""}
                      onChange={(e) => updateElement(selectedElement.id, { url: e.target.value })}
                      className="w-full p-1.5 rounded border border-border bg-background"
                    />
                  </div>
                )}
              </div>
            ) : selectedFormField ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <FormInput className="w-3.5 h-3.5 text-blue-600" />
                    <span className="capitalize">{selectedFormField.type} Field</span>
                  </div>
                  <button
                    onClick={() => deleteFormField(selectedFormField.id)}
                    className="p-1 rounded text-red-500 hover:bg-red-500/10"
                    title="Delete Form Field"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1">Field Name (ID)</label>
                  <input
                    type="text"
                    value={selectedFormField.name}
                    onChange={(e) => updateFormField(selectedFormField.id, { name: e.target.value })}
                    className="w-full p-1.5 rounded border border-border bg-background font-mono text-xs"
                  />
                </div>

                {selectedFormField.type === "text" && (
                  <div>
                    <label className="text-muted-foreground block mb-1">Current / Default Value</label>
                    <input
                      type="text"
                      value={String(selectedFormField.value ?? selectedFormField.defaultValue ?? "")}
                      onChange={(e) => updateFormField(selectedFormField.id, { value: e.target.value })}
                      className="w-full p-1.5 rounded border border-border bg-background text-xs"
                    />
                  </div>
                )}

                {(selectedFormField.type === "dropdown" ||
                  selectedFormField.type === "listbox" ||
                  selectedFormField.type === "radio") && (
                  <div>
                    <label className="text-muted-foreground block mb-1">Options (comma-separated)</label>
                    <input
                      type="text"
                      value={(selectedFormField.options || []).join(", ")}
                      onChange={(e) =>
                        updateFormField(selectedFormField.id, {
                          options: e.target.value
                            .split(",")
                            .map((o) => o.trim())
                            .filter(Boolean),
                        })
                      }
                      className="w-full p-1.5 rounded border border-border bg-background text-xs"
                    />
                  </div>
                )}

                <div className="border-t border-border pt-3 space-y-2">
                  <span className="font-semibold text-foreground block">Field Settings:</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFormField.isReadOnly || false}
                      onChange={(e) =>
                        updateFormField(selectedFormField.id, { isReadOnly: e.target.checked })
                      }
                      className="rounded border-border text-primary"
                    />
                    <span>Read-Only</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFormField.isRequired || false}
                      onChange={(e) =>
                        updateFormField(selectedFormField.id, { isRequired: e.target.checked })
                      }
                      className="rounded border-border text-primary"
                    />
                    <span>Required Field</span>
                  </label>
                  {selectedFormField.type === "text" && (
                    <>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedFormField.isMultiline || false}
                          onChange={(e) =>
                            updateFormField(selectedFormField.id, { isMultiline: e.target.checked })
                          }
                          className="rounded border-border text-primary"
                        />
                        <span>Multiline Text Box</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedFormField.isPassword || false}
                          onChange={(e) =>
                            updateFormField(selectedFormField.id, { isPassword: e.target.checked })
                          }
                          className="rounded border-border text-primary"
                        />
                        <span>Mask as Password</span>
                      </label>
                    </>
                  )}
                </div>
              </div>
            ) : selectedRedaction ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div className="flex items-center gap-1.5 font-semibold text-red-600">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Permanent Redaction</span>
                  </div>
                  <button
                    onClick={() => deleteRedaction(selectedRedaction.id)}
                    className="p-1 rounded text-red-500 hover:bg-red-500/10"
                    title="Remove Redaction Box"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1">Exemption Code / Label</label>
                  <input
                    type="text"
                    value={selectedRedaction.label || "[REDACTED]"}
                    onChange={(e) => updateRedaction(selectedRedaction.id, { label: e.target.value })}
                    className="w-full p-1.5 rounded border border-border bg-background font-mono text-xs"
                  />
                  <span className="text-[10px] text-muted-foreground block mt-1">
                    Examples: [REDACTED], FOIA (b)(4), PRIVILEGED
                  </span>
                </div>

                <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900/40 text-[11px] text-red-700 dark:text-red-300">
                  This area will be permanently burned on export. Underlying characters and graphics cannot be recovered.
                </div>
              </div>
            ) : (
              /* Nothing selected: Show document and page summary */
              <div className="space-y-4">
                <div className="p-3 bg-muted/40 rounded-lg border border-border/60 space-y-2">
                  <span className="font-semibold text-foreground block">Current Page Info</span>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Page:</span>
                    <span className="font-medium text-foreground">
                      {activePageIndex + 1} of {pages.length}
                    </span>
                  </div>
                  {currentPage && (
                    <>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Dimensions:</span>
                        <span className="font-mono text-[11px] text-foreground">
                          {Math.round(currentPage.width)} × {Math.round(currentPage.height)} pt
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Orientation:</span>
                        <span className="text-foreground">
                          {currentPage.width > currentPage.height ? "Landscape" : "Portrait"} ({currentPage.rotation}°)
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Click on any text, shape, annotation, or signature on the canvas to inspect and edit its vector properties.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: COMMENTS */}
        {activeTab === "comments" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Annotations & Notes</span>
              {allComments.length > 0 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onExportComments("txt")}
                    title="Export comments as Text"
                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground text-[11px] flex items-center gap-1"
                  >
                    <FileDown className="w-3 h-3" />
                    TXT
                  </button>
                  <button
                    onClick={() => onExportComments("json")}
                    title="Export comments as JSON"
                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground text-[11px] flex items-center gap-1"
                  >
                    JSON
                  </button>
                </div>
              )}
            </div>

            {allComments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No comments or sticky notes yet.</p>
                <p className="text-[11px] mt-1">Use the Sticky Note tool in Annotate mode to place notes.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {allComments.map((c, i) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setActivePageIndex(c.pageIndex);
                      selectObject(c.id, "annotation");
                    }}
                    className="p-2.5 rounded-lg border border-border bg-background hover:border-primary cursor-pointer transition-all space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-foreground">
                        Page {c.pageIndex + 1}
                      </span>
                      <span className="text-muted-foreground">{c.createdAt || "Just now"}</span>
                    </div>
                    <p className="text-foreground text-xs line-clamp-3">
                      {c.text || c.comment || "(Empty note)"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: STAMPS & DOCUMENT-WIDE OVERLAYS */}
        {activeTab === "stamps" && (
          <div className="space-y-6">
            {/* Watermark Section */}
            <div className="space-y-2 border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Watermark</span>
                <input
                  type="checkbox"
                  checked={watermark?.enabled || false}
                  onChange={(e) =>
                    setWatermark(
                      e.target.checked
                        ? {
                            enabled: true,
                            text: watermark?.text || "CONFIDENTIAL",
                            color: watermark?.color || "#94a3b8",
                            opacity: watermark?.opacity || 0.2,
                            fontSize: watermark?.fontSize || 48,
                            rotation: watermark?.rotation || 45,
                          }
                        : null
                    )
                  }
                  className="rounded text-primary focus:ring-primary"
                />
              </div>

              {watermark?.enabled && (
                <div className="space-y-2.5 pt-2">
                  <div>
                    <label className="text-muted-foreground block mb-1">Watermark Text</label>
                    <input
                      type="text"
                      value={watermark.text}
                      onChange={(e) => setWatermark({ ...watermark, text: e.target.value })}
                      className="w-full p-1.5 rounded border border-border bg-background"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-muted-foreground block mb-1">Size ({watermark.fontSize}pt)</label>
                      <input
                        type="range"
                        min="24"
                        max="80"
                        value={watermark.fontSize}
                        onChange={(e) =>
                          setWatermark({ ...watermark, fontSize: parseInt(e.target.value) })
                        }
                        className="w-full accent-primary"
                      />
                    </div>
                    <div>
                      <label className="text-muted-foreground block mb-1">Angle ({watermark.rotation}°)</label>
                      <input
                        type="range"
                        min="-90"
                        max="90"
                        value={watermark.rotation}
                        onChange={(e) =>
                          setWatermark({ ...watermark, rotation: parseInt(e.target.value) })
                        }
                        className="w-full accent-primary"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Page Numbering Section */}
            <div className="space-y-2 border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Page Numbering</span>
                <input
                  type="checkbox"
                  checked={pageNumbering?.enabled || false}
                  onChange={(e) =>
                    setPageNumbering(
                      e.target.checked
                        ? {
                            enabled: true,
                            format: pageNumbering?.format || "page-of-total",
                            position: pageNumbering?.position || "bottom-center",
                            fontSize: pageNumbering?.fontSize || 9,
                            color: pageNumbering?.color || "#4b5563",
                          }
                        : null
                    )
                  }
                  className="rounded text-primary focus:ring-primary"
                />
              </div>

              {pageNumbering?.enabled && (
                <div className="space-y-2.5 pt-2">
                  <div>
                    <label className="text-muted-foreground block mb-1">Format</label>
                    <Select
                      value={pageNumbering.format}
                      onValueChange={(val) =>
                        setPageNumbering({ ...pageNumbering, format: val as any })
                      }
                    >
                      <SelectTrigger className="w-full h-8 text-xs bg-background border-border">
                        <SelectValue placeholder="Format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="page-of-total">Page 1 of 5</SelectItem>
                        <SelectItem value="page">Page 1</SelectItem>
                        <SelectItem value="simple">1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-muted-foreground block mb-1">Position</label>
                    <Select
                      value={pageNumbering.position}
                      onValueChange={(val) =>
                        setPageNumbering({ ...pageNumbering, position: val as any })
                      }
                    >
                      <SelectTrigger className="w-full h-8 text-xs bg-background border-border">
                        <SelectValue placeholder="Position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bottom-center">Bottom Center</SelectItem>
                        <SelectItem value="bottom-right">Bottom Right</SelectItem>
                        <SelectItem value="bottom-left">Bottom Left</SelectItem>
                        <SelectItem value="top-right">Top Right</SelectItem>
                        <SelectItem value="top-center">Top Center</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {/* Bates Numbering Section */}
            <div className="space-y-2 border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Bates Stamping (Legal)</span>
                <input
                  type="checkbox"
                  checked={bates?.enabled || false}
                  onChange={(e) =>
                    setBates(
                      e.target.checked
                        ? {
                            enabled: true,
                            prefix: bates?.prefix || "CONF-",
                            suffix: bates?.suffix || "",
                            startNumber: bates?.startNumber || 1,
                            digits: bates?.digits || 6,
                            position: bates?.position || "bottom-right",
                          }
                        : null
                    )
                  }
                  className="rounded text-primary focus:ring-primary"
                />
              </div>

              {bates?.enabled && (
                <div className="space-y-2.5 pt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-muted-foreground block mb-1">Prefix</label>
                      <input
                        type="text"
                        value={bates.prefix}
                        onChange={(e) => setBates({ ...bates, prefix: e.target.value })}
                        className="w-full p-1.5 rounded border border-border bg-background font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-muted-foreground block mb-1">Start #</label>
                      <input
                        type="number"
                        min="1"
                        value={bates.startNumber}
                        onChange={(e) =>
                          setBates({ ...bates, startNumber: parseInt(e.target.value) || 1 })
                        }
                        className="w-full p-1.5 rounded border border-border bg-background font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Header & Footer Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Header & Footer</span>
                <input
                  type="checkbox"
                  checked={headerFooter?.enabled || false}
                  onChange={(e) =>
                    setHeaderFooter(
                      e.target.checked
                        ? {
                            enabled: true,
                            headerText: headerFooter?.headerText || "CONFIDENTIAL DOCUMENT",
                            footerText: headerFooter?.footerText || "ALL RIGHTS RESERVED",
                            fontSize: headerFooter?.fontSize || 8,
                            color: headerFooter?.color || "#6b7280",
                          }
                        : null
                    )
                  }
                  className="rounded text-primary focus:ring-primary"
                />
              </div>

              {headerFooter?.enabled && (
                <div className="space-y-2.5 pt-2">
                  <div>
                    <label className="text-muted-foreground block mb-1">Header Text</label>
                    <input
                      type="text"
                      value={headerFooter.headerText}
                      onChange={(e) =>
                        setHeaderFooter({ ...headerFooter, headerText: e.target.value })
                      }
                      className="w-full p-1.5 rounded border border-border bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground block mb-1">Footer Text</label>
                    <input
                      type="text"
                      value={headerFooter.footerText}
                      onChange={(e) =>
                        setHeaderFooter({ ...headerFooter, footerText: e.target.value })
                      }
                      className="w-full p-1.5 rounded border border-border bg-background"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: SECURITY & METADATA */}
        {activeTab === "security" && (
          <div className="space-y-6">
            {/* Metadata Section */}
            <div className="space-y-3 border-b border-border pb-4">
              <span className="font-semibold text-foreground block">Document Metadata</span>
              <div>
                <label className="text-muted-foreground block mb-1">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Master Services Agreement"
                  value={metadata.title || ""}
                  onChange={(e) => setMetadata({ title: e.target.value })}
                  className="w-full p-1.5 rounded border border-border bg-background text-xs"
                />
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">Author / Organization</label>
                <input
                  type="text"
                  placeholder="e.g. Legal Department"
                  value={metadata.author || ""}
                  onChange={(e) => setMetadata({ author: e.target.value })}
                  className="w-full p-1.5 rounded border border-border bg-background text-xs"
                />
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Confidential Contract"
                  value={metadata.subject || ""}
                  onChange={(e) => setMetadata({ subject: e.target.value })}
                  className="w-full p-1.5 rounded border border-border bg-background text-xs"
                />
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">Keywords (comma-separated)</label>
                <input
                  type="text"
                  placeholder="contract, privacy, agreement"
                  value={metadata.keywords || ""}
                  onChange={(e) => setMetadata({ keywords: e.target.value })}
                  className="w-full p-1.5 rounded border border-border bg-background text-xs"
                />
              </div>
            </div>

            {/* Document Protection Status */}
            <div className="space-y-3 border-b border-border pb-4">
              <span className="font-semibold text-foreground block">Password Protection</span>
              <div
                className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                  security.isEncrypted
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                    : "bg-muted/40 border-border text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>
                    {security.isEncrypted ? "Document Encrypted (Password Set)" : "No Password Set"}
                  </span>
                </div>
              </div>
            </div>

            {/* Document Flattening */}
            <div className="space-y-3">
              <span className="font-semibold text-foreground block">Document Flattening</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Permanently burn interactive layers into the static PDF content stream so they cannot be selected or modified.
              </p>
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => flattenDocument("forms")}
                  className="w-full py-1.5 px-2 rounded-md border border-border hover:bg-muted text-xs font-medium text-foreground transition-colors flex items-center justify-center gap-1.5"
                >
                  <FormInput className="w-3.5 h-3.5" />
                  <span>Flatten All Form Fields</span>
                </button>
                <button
                  type="button"
                  onClick={() => flattenDocument("annotations")}
                  className="w-full py-1.5 px-2 rounded-md border border-border hover:bg-muted text-xs font-medium text-foreground transition-colors flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Flatten All Annotations</span>
                </button>
                <button
                  type="button"
                  onClick={() => flattenDocument("all")}
                  className="w-full py-1.5 px-2 rounded-md bg-muted/80 hover:bg-muted border border-border/80 text-xs font-semibold text-foreground transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Flatten Entire Document</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
