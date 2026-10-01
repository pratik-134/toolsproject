import React, { useRef } from "react";
import {
  MousePointer,
  RotateCw,
  RotateCcw,
  Copy,
  Plus,
  Trash2,
  Highlighter,
  Underline as UnderlineIcon,
  Strikethrough as StrikeIcon,
  Pencil,
  Square,
  Circle,
  Minus,
  MoveRight,
  MessageSquare,
  Stamp,
  Type,
  Eraser,
  Image as ImageIcon,
  Link2,
  Calendar,
  PenTool,
  Upload,
  Hash,
  Binary,
  AlignVerticalJustifyCenter,
  Split,
  Download,
  FormInput,
  CheckSquare,
  Radio,
  ChevronDown,
  ListFilter,
  ShieldAlert,
  Lock,
  Search,
  FileDown,
  FileCheck,
} from "lucide-react";
import { usePdfEditorStore } from "../store";
import { EditorTool } from "../types";

interface ToolbarProps {
  onOpenSignatureModal: (initialTab: "draw" | "type" | "upload" | "initials") => void;
  onInsertImageClick: () => void;
  onMergeFileClick: () => void;
  onExtractPagesClick: () => void;
  onOpenSearchRedact: () => void;
  onOpenSecurityModal: () => void;
  onExportFormData: (format: "json" | "fdf") => void;
  onImportFormDataClick: () => void;
  onFlattenClick: (target: "forms" | "annotations" | "all") => void;
  activeColor: string;
  onChangeColor: (color: string) => void;
  activeStrokeWidth: number;
  onChangeStrokeWidth: (w: number) => void;
  onAddStamp: (text: string, color: string) => void;
  onAddDate: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onOpenSignatureModal,
  onInsertImageClick,
  onMergeFileClick,
  onExtractPagesClick,
  onOpenSearchRedact,
  onOpenSecurityModal,
  onExportFormData,
  onImportFormDataClick,
  onFlattenClick,
  activeColor,
  onChangeColor,
  activeStrokeWidth,
  onChangeStrokeWidth,
  onAddStamp,
  onAddDate,
}) => {
  const {
    mode,
    activeTool,
    setActiveTool,
    activePageIndex,
    pages,
    rotatePage,
    rotateAllPages,
    duplicatePage,
    insertBlankPage,
    deletePage,
    selectedObjectId,
    selectedObjectType,
    deleteAnnotation,
    deleteElement,
  } = usePdfEditorStore();

  const colors = [
    { label: "Yellow", hex: "#eab308" },
    { label: "Green", hex: "#22c55e" },
    { label: "Blue", hex: "#3b82f6" },
    { label: "Red", hex: "#ef4444" },
    { label: "Purple", hex: "#a855f7" },
    { label: "Dark Gray", hex: "#1f2937" },
  ];

  const strokeWidths = [1, 2, 4, 8];

  const stampPresets = [
    { text: "APPROVED", color: "#16a34a" },
    { text: "CONFIDENTIAL", color: "#dc2626" },
    { text: "DRAFT", color: "#6b7280" },
    { text: "FINAL", color: "#2563eb" },
    { text: "VOID", color: "#991b1b" },
    { text: "REVIEWED", color: "#0891b2" },
  ];

  const handleDeleteSelected = () => {
    if (!selectedObjectId) return;
    if (selectedObjectType === "annotation") {
      deleteAnnotation(selectedObjectId);
    } else if (selectedObjectType === "element") {
      deleteElement(selectedObjectId);
    }
  };

  return (
    <div className="min-h-12 border-b border-border bg-card/50 px-4 py-1.5 flex flex-wrap items-center justify-between gap-3 text-xs select-none">
      {/* Primary Tool Buttons based on Mode */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Mode: ORGANIZE */}
        {mode === "organize" && (
          <>
            <button
              onClick={() => rotatePage(activePageIndex, "ccw")}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md hover:bg-muted text-foreground transition-colors"
              title="Rotate Current Page CCW 90°"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Rotate CCW</span>
            </button>
            <button
              onClick={() => rotatePage(activePageIndex, "cw")}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md hover:bg-muted text-foreground transition-colors"
              title="Rotate Current Page CW 90°"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Rotate CW</span>
            </button>
            <button
              onClick={() => rotateAllPages("cw")}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Rotate All Pages 90°"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Rotate All</span>
            </button>

            <div className="h-4 w-px bg-border/80 mx-1" />

            <button
              onClick={() => duplicatePage(activePageIndex)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md hover:bg-muted text-foreground transition-colors"
              title="Duplicate Current Page"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Duplicate</span>
            </button>

            <button
              onClick={() => insertBlankPage(activePageIndex)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md hover:bg-muted text-foreground transition-colors"
              title="Insert Blank Page After Current"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Insert Blank</span>
            </button>

            <button
              onClick={onMergeFileClick}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md hover:bg-muted text-foreground transition-colors"
              title="Merge / Insert Pages from Another PDF"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Insert from PDF</span>
            </button>

            <button
              onClick={onExtractPagesClick}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md hover:bg-muted text-foreground transition-colors"
              title="Extract / Split Pages"
            >
              <Split className="w-3.5 h-3.5" />
              <span>Extract Pages</span>
            </button>

            <div className="h-4 w-px bg-border/80 mx-1" />

            <button
              onClick={() => deletePage(activePageIndex)}
              disabled={pages.length <= 1}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-red-600 hover:bg-red-500/10 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              title="Delete Current Page"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Page</span>
            </button>
          </>
        )}

        {/* Mode: ANNOTATE */}
        {mode === "annotate" && (
          <>
            <button
              onClick={() => setActiveTool("select")}
              className={`p-1.5 rounded-md transition-colors ${
                activeTool === "select" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
              }`}
              title="Select / Move Annotations"
            >
              <MousePointer className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-border/80 mx-0.5" />

            <button
              onClick={() => setActiveTool("highlight")}
              className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors ${
                activeTool === "highlight" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
              }`}
              title="Highlight Text Area"
            >
              <Highlighter className="w-3.5 h-3.5" />
              <span>Highlight</span>
            </button>

            <button
              onClick={() => setActiveTool("underline")}
              className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors ${
                activeTool === "underline" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
              }`}
              title="Underline Text"
            >
              <UnderlineIcon className="w-3.5 h-3.5" />
              <span>Underline</span>
            </button>

            <button
              onClick={() => setActiveTool("strike")}
              className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors ${
                activeTool === "strike" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
              }`}
              title="Strikethrough"
            >
              <StrikeIcon className="w-3.5 h-3.5" />
              <span>Strikethrough</span>
            </button>

            <button
              onClick={() => setActiveTool("draw")}
              className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors ${
                activeTool === "draw" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
              }`}
              title="Freehand Pencil / Pen Drawing"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Draw</span>
            </button>

            <div className="h-4 w-px bg-border/80 mx-0.5" />

            <button
              onClick={() => setActiveTool("shape-rect")}
              className={`p-1.5 rounded-md transition-colors ${
                activeTool === "shape-rect" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
              }`}
              title="Rectangle"
            >
              <Square className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTool("shape-circle")}
              className={`p-1.5 rounded-md transition-colors ${
                activeTool === "shape-circle" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
              }`}
              title="Circle / Ellipse"
            >
              <Circle className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTool("line")}
              className={`p-1.5 rounded-md transition-colors ${
                activeTool === "line" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
              }`}
              title="Straight Line"
            >
              <Minus className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTool("arrow")}
              className={`p-1.5 rounded-md transition-colors ${
                activeTool === "arrow" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
              }`}
              title="Arrow"
            >
              <MoveRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTool("sticky")}
              className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors ${
                activeTool === "sticky" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
              }`}
              title="Add Sticky Note Comment"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Sticky Note</span>
            </button>

            {/* Stamps drop down menu */}
            <div className="relative group">
              <button
                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-muted text-foreground transition-colors"
                title="Insert Pre-made Stamp"
              >
                <Stamp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Stamps</span>
              </button>
              <div className="absolute left-0 top-full mt-1 hidden group-hover:flex flex-col bg-popover border border-border rounded-lg shadow-lg p-1.5 z-40 min-w-[140px]">
                {stampPresets.map((s) => (
                  <button
                    key={s.text}
                    onClick={() => onAddStamp(s.text, s.color)}
                    className="text-left px-2.5 py-1.5 rounded hover:bg-muted text-xs font-semibold flex items-center justify-between"
                  >
                    <span>{s.text}</span>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Mode: EDIT CONTENT */}
        {mode === "content" && (
          <>
            <button
              onClick={() => setActiveTool("select")}
              className={`p-1.5 rounded-md transition-colors ${
                activeTool === "select" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
              }`}
              title="Select / Move Objects"
            >
              <MousePointer className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTool("text")}
              className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors ${
                activeTool === "text" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
              }`}
              title="Add New Vector Text"
            >
              <Type className="w-3.5 h-3.5" />
              <span>Add Text</span>
            </button>

            <button
              onClick={() => setActiveTool("whiteout")}
              className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors ${
                activeTool === "whiteout" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
              }`}
              title="Whiteout Redact / Replace Text"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Whiteout Box</span>
            </button>

            <button
              onClick={onInsertImageClick}
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-muted text-foreground transition-colors"
              title="Insert Image (PNG / JPG / WebP)"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Add Image</span>
            </button>

            <button
              onClick={() => setActiveTool("text")}
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-muted text-foreground transition-colors"
              title="Add Clickable Link Box"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Add Link</span>
            </button>
          </>
        )}

        {/* Mode: SIGN */}
        {mode === "sign" && (
          <>
            <button
              onClick={() => onOpenSignatureModal("draw")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Draw Signature</span>
            </button>

            <button
              onClick={() => onOpenSignatureModal("type")}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md hover:bg-muted text-foreground transition-colors"
            >
              <Type className="w-3.5 h-3.5" />
              <span>Type Signature</span>
            </button>

            <button
              onClick={() => onOpenSignatureModal("upload")}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md hover:bg-muted text-foreground transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Signature Image</span>
            </button>

            <div className="h-4 w-px bg-border/80 mx-1" />

            <button
              onClick={() => onOpenSignatureModal("initials")}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md hover:bg-muted text-foreground transition-colors"
            >
              <span>Add Initials</span>
            </button>

            <button
              onClick={onAddDate}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md hover:bg-muted text-foreground transition-colors"
              title="Stamp Today's Date"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Date Stamp</span>
            </button>
          </>
        )}

        {/* Mode: STAMP */}
        {mode === "stamp" && (
          <div className="text-muted-foreground flex items-center gap-2">
            <span>Configure document-wide Watermarks, Bates numbering, Page numbers, and Headers/Footers in the right sidebar.</span>
          </div>
        )}

        {/* Mode: FORMS */}
        {mode === "forms" && (
          <>
            <button
              onClick={() => setActiveTool("select")}
              className={`p-1.5 rounded-md transition-colors ${
                activeTool === "select" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
              }`}
              title="Select / Move Form Fields"
            >
              <MousePointer className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-border/80 mx-0.5" />

            <button
              onClick={() => setActiveTool("form-text")}
              className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors ${
                activeTool === "form-text" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
              }`}
              title="Add Single or Multiline Text Field"
            >
              <FormInput className="w-3.5 h-3.5" />
              <span>Text Field</span>
            </button>

            <button
              onClick={() => setActiveTool("form-check")}
              className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors ${
                activeTool === "form-check" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
              }`}
              title="Add Checkbox"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Checkbox</span>
            </button>

            <button
              onClick={() => setActiveTool("form-radio")}
              className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors ${
                activeTool === "form-radio" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
              }`}
              title="Add Radio Button Option"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Radio</span>
            </button>

            <button
              onClick={() => setActiveTool("form-dropdown")}
              className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors ${
                activeTool === "form-dropdown" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
              }`}
              title="Add Dropdown Combo Box"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Dropdown</span>
            </button>

            <button
              onClick={() => setActiveTool("form-listbox")}
              className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors ${
                activeTool === "form-listbox" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
              }`}
              title="Add List Box"
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>List Box</span>
            </button>

            <button
              onClick={() => setActiveTool("form-button")}
              className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors ${
                activeTool === "form-button" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
              }`}
              title="Add Submit / Reset Button"
            >
              <span>Submit Button</span>
            </button>

            <div className="h-4 w-px bg-border/80 mx-1" />

            <button
              onClick={() => onExportFormData("json")}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md hover:bg-muted text-foreground transition-colors"
              title="Export Form Data as JSON"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={() => onExportFormData("fdf")}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md hover:bg-muted text-foreground transition-colors"
              title="Export Form Data as Adobe FDF"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Export FDF</span>
            </button>

            <button
              onClick={onImportFormDataClick}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md hover:bg-muted text-foreground transition-colors"
              title="Import Form Data from JSON"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import JSON</span>
            </button>
          </>
        )}

        {/* Mode: REDACT */}
        {mode === "redact" && (
          <>
            <button
              onClick={() => setActiveTool("select")}
              className={`p-1.5 rounded-md transition-colors ${
                activeTool === "select" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
              }`}
              title="Select / Move Redactions"
            >
              <MousePointer className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTool("redact-box")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTool === "redact-box" ? "bg-red-600 text-white" : "hover:bg-muted text-red-600"
              }`}
              title="Drag to Mark Area for Permanent Redaction"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Mark Redaction Box</span>
            </button>

            <button
              onClick={onOpenSearchRedact}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-muted text-foreground transition-colors"
              title="Search Document and Batch Redact All Matches"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search & Redact</span>
            </button>
          </>
        )}

        {/* Mode: SECURITY */}
        {mode === "security" && (
          <>
            <button
              onClick={onOpenSecurityModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors"
              title="Configure Password Encryption & Permissions"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Password & Permissions</span>
            </button>

            <div className="h-4 w-px bg-border/80 mx-1" />

            <button
              onClick={() => onFlattenClick("forms")}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md hover:bg-muted text-foreground transition-colors"
              title="Convert Interactive Form Fields to Permanent Static Content"
            >
              <span>Flatten Forms</span>
            </button>

            <button
              onClick={() => onFlattenClick("annotations")}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md hover:bg-muted text-foreground transition-colors"
              title="Bake All Annotations into Static Page Content"
            >
              <span>Flatten Annotations</span>
            </button>
          </>
        )}
      </div>

      {/* Right side: Color Picker, Stroke Width & Selection Actions */}
      {(mode === "annotate" || mode === "content") && (
        <div className="flex items-center gap-2">
          {/* Colors */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/50">
            {colors.map((c) => (
              <button
                key={c.hex}
                onClick={() => onChangeColor(c.hex)}
                className={`w-4 h-4 rounded-full transition-transform ${
                  activeColor === c.hex ? "scale-125 ring-2 ring-primary ring-offset-1" : "hover:scale-110"
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.label}
              />
            ))}
          </div>

          {/* Stroke Width (only for drawing / shapes) */}
          {mode === "annotate" && (
            <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/50">
              {strokeWidths.map((w) => (
                <button
                  key={w}
                  onClick={() => onChangeStrokeWidth(w)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    activeStrokeWidth === w ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {w}px
                </button>
              ))}
            </div>
          )}

          {/* Delete Selected Item */}
          {selectedObjectId && (
            <button
              onClick={handleDeleteSelected}
              className="p-1.5 rounded-md text-red-500 hover:bg-red-500/10 transition-colors"
              title="Delete Selected Item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
