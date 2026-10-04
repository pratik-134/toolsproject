import React, { useRef } from "react";
import {
  Layers,
  Highlighter,
  Underline as UnderlineIcon,
  Strikethrough as StrikeIcon,
  Pencil,
  Square,
  Circle,
  Minus,
  MoveRight,
  MessageSquare,
  Eraser,
  Type,
  Image as ImageIcon,
  Link2,
  Replace,
  FormInput,
  CheckSquare,
  Radio,
  ChevronDown,
  ListFilter,
  ShieldAlert,
  Search,
  FileSignature,
  Stamp,
  Lock,
  Sparkles,
  ScanText,
  GitCompare,
  Upload,
  Download,
  RotateCw,
  RotateCcw,
  Copy,
  Plus,
  Trash2,
  Calendar,
  PenTool,
  Hash,
  Split,
  FileCheck,
  Check,
  FileText,
  Sliders,
} from "lucide-react";
import { usePdfEditorStore } from "../store";
import { EditorMode, EditorTool, FormFieldDef } from "../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditPanelProps {
  onOpenSignatureModal: (tab: "draw" | "type" | "upload" | "initials") => void;
  onInsertImageClick: () => void;
  onMergeFileClick: () => void;
  onExtractPagesClick: () => void;
  onOpenSearchRedact: () => void;
  onOpenSecurityModal: () => void;
  onOpenConvertModal: () => void;
  onOpenOcrModal: () => void;
  onOpenCompareModal: () => void;
  onOpenFindReplaceModal: () => void;
  onExportFormData: (format: "json" | "fdf") => void;
  onImportFormDataClick: () => void;
  onFlattenClick: (target: "forms" | "annotations" | "all") => void;
  activeColor: string;
  onChangeColor: (color: string) => void;
  activeStrokeWidth: number;
  onChangeStrokeWidth: (w: number) => void;
  onAddStamp: (text: string, color: string) => void;
  onAddDate: () => void;
  onExportComments: (format: "json" | "txt") => void;
}

export const EditPanel: React.FC<EditPanelProps> = ({
  onOpenSignatureModal,
  onInsertImageClick,
  onMergeFileClick,
  onExtractPagesClick,
  onOpenSearchRedact,
  onOpenSecurityModal,
  onOpenConvertModal,
  onOpenOcrModal,
  onOpenCompareModal,
  onOpenFindReplaceModal,
  onExportFormData,
  onImportFormDataClick,
  onFlattenClick,
  activeColor,
  onChangeColor,
  activeStrokeWidth,
  onChangeStrokeWidth,
  onAddStamp,
  onAddDate,
  onExportComments,
}) => {
  const {
    mode,
    setMode,
    activeTool,
    setActiveTool,
    activePageIndex,
    setActivePageIndex,
    pages,
    reorderPages,
    rotatePage,
    rotateAllPages,
    duplicatePage,
    insertBlankPage,
    deletePage,
    selectedObjectId,
    selectedObjectType,
    deleteAnnotation,
    deleteElement,
    deleteFormField,
    deleteRedaction,
    annotations,
    elements,
    formFields,
    updateFormField,
    redactions,
    updateRedaction,
    metadata,
    setMetadata,
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
  } = usePdfEditorStore();

  const selectedFormField =
    selectedObjectType === "formField"
      ? formFields.find((f) => f.id === selectedObjectId)
      : null;

  const selectedRedaction =
    selectedObjectType === "redaction"
      ? redactions.find((r) => r.id === selectedObjectId)
      : null;

  const colors = [
    { label: "Yellow", hex: "#eab308" },
    { label: "Green", hex: "#22c55e" },
    { label: "Blue", hex: "#3b82f6" },
    { label: "Red", hex: "#ef4444" },
    { label: "Purple", hex: "#a855f7" },
    { label: "Orange", hex: "#f97316" },
    { label: "Black", hex: "#000000" },
    { label: "White", hex: "#ffffff" },
  ];

  const strokeWidths = [1, 2, 4, 8];

  const modesList: { id: EditorMode; label: string; icon: React.ElementType }[] = [
    { id: "organize", label: "Pages", icon: Layers },
    { id: "annotate", label: "Annotate", icon: Highlighter },
    { id: "content", label: "Content", icon: Type },
    { id: "forms", label: "Forms", icon: FormInput },
    { id: "redact", label: "Redact", icon: ShieldAlert },
    { id: "sign", label: "Sign", icon: FileSignature },
    { id: "stamp", label: "Stamps", icon: Stamp },
    { id: "security", label: "Security", icon: Lock },
    { id: "convert", label: "Convert & OCR", icon: Sparkles },
  ];

  const pageAnnotations = annotations.filter((a) => a.pageIndex === activePageIndex);
  const pageElements = elements.filter((e) => e.pageIndex === activePageIndex);
  const pageFormFields = formFields.filter((f) => f.pageIndex === activePageIndex);
  const pageRedactions = redactions.filter((r) => r.pageIndex === activePageIndex);

  return (
    <div className="w-full lg:w-[410px] xl:w-[440px] h-full flex flex-col bg-card border-r border-border shrink-0 select-none overflow-hidden">
      {/* ── Top Mode Navigation Switcher ──────────────────────────────── */}
      <div className="p-2 border-b border-border bg-muted/30 shrink-0">
        <div className="grid grid-cols-5 gap-1">
          {modesList.slice(0, 5).map((m) => {
            const Icon = m.icon;
            const isActive = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[11px] font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span className="truncate max-w-[65px]">{m.label}</span>
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-4 gap-1 mt-1">
          {modesList.slice(5).map((m) => {
            const Icon = m.icon;
            const isActive = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-[11px] font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-3.5 h-3.5 mb-0.5" />
                <span className="truncate max-w-[70px]">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Scrollable Edit Body ──────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* ========================================================
            MODE 1: ORGANIZE PAGES
            ======================================================== */}
        {mode === "organize" && (
          <div className="space-y-4">
            {/* Quick Actions Grid */}
            <div className="space-y-2">
              <span className="font-bold text-foreground uppercase tracking-wider text-[10px] text-muted-foreground">
                Page Operations
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => rotatePage(activePageIndex, "cw")}
                  className="p-2.5 rounded-xl border border-border bg-muted/20 hover:bg-muted flex items-center gap-2 font-medium text-foreground transition-colors"
                >
                  <RotateCw className="w-4 h-4 text-primary" />
                  <span>Rotate Page (90°)</span>
                </button>
                <button
                  onClick={() => rotateAllPages("cw")}
                  className="p-2.5 rounded-xl border border-border bg-muted/20 hover:bg-muted flex items-center gap-2 font-medium text-foreground transition-colors"
                >
                  <RotateCw className="w-4 h-4 text-amber-500" />
                  <span>Rotate All Pages</span>
                </button>
                <button
                  onClick={() => insertBlankPage(activePageIndex)}
                  className="p-2.5 rounded-xl border border-border bg-muted/20 hover:bg-muted flex items-center gap-2 font-medium text-foreground transition-colors"
                >
                  <Plus className="w-4 h-4 text-emerald-500" />
                  <span>Insert Blank Page</span>
                </button>
                <button
                  onClick={onMergeFileClick}
                  className="p-2.5 rounded-xl border border-border bg-muted/20 hover:bg-muted flex items-center gap-2 font-medium text-foreground transition-colors"
                >
                  <Upload className="w-4 h-4 text-blue-500" />
                  <span>Insert from PDF</span>
                </button>
                <button
                  onClick={() => duplicatePage(activePageIndex)}
                  className="p-2.5 rounded-xl border border-border bg-muted/20 hover:bg-muted flex items-center gap-2 font-medium text-foreground transition-colors"
                >
                  <Copy className="w-4 h-4 text-purple-500" />
                  <span>Duplicate Page</span>
                </button>
                <button
                  onClick={onExtractPagesClick}
                  className="p-2.5 rounded-xl border border-border bg-muted/20 hover:bg-muted flex items-center gap-2 font-medium text-foreground transition-colors"
                >
                  <Split className="w-4 h-4 text-cyan-500" />
                  <span>Extract Pages</span>
                </button>
              </div>

              {pages.length > 1 && (
                <button
                  onClick={() => deletePage(activePageIndex)}
                  className="w-full p-2.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 flex items-center justify-center gap-2 font-semibold transition-colors mt-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Active Page ({activePageIndex + 1})</span>
                </button>
              )}
            </div>

            {/* Thumbnail Manager */}
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground uppercase tracking-wider text-[10px] text-muted-foreground">
                  Document Pages ({pages.length})
                </span>
                <span className="text-[11px] text-muted-foreground">Click to navigate</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 max-h-[46vh] overflow-y-auto p-1">
                {pages.map((p, idx) => {
                  const isActive = idx === activePageIndex;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setActivePageIndex(idx)}
                      className={`group relative flex flex-col items-center p-2 rounded-xl border transition-all cursor-pointer ${
                        isActive
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                          : "border-border bg-card hover:border-primary/50 hover:bg-muted/30"
                      }`}
                    >
                      <div className="w-full aspect-3/4 rounded-md bg-white border border-border/80 flex items-center justify-center overflow-hidden shadow-2xs relative">
                        {p.thumbnailUrl ? (
                          <img src={p.thumbnailUrl} alt={`Page ${idx + 1}`} className="w-full h-full object-contain" />
                        ) : (
                          <div className="flex flex-col items-center text-muted-foreground gap-1">
                            <span className="text-sm font-bold text-slate-700">{idx + 1}</span>
                            <span className="text-[9px] uppercase tracking-wider text-slate-400">PDF Page</span>
                          </div>
                        )}
                        {p.rotation !== 0 && (
                          <span className="absolute bottom-1 right-1 text-[9px] bg-black/70 text-white px-1 rounded">
                            {p.rotation}°
                          </span>
                        )}
                      </div>

                      <div className="w-full flex items-center justify-between mt-1.5 px-0.5">
                        <span className={`text-[11px] font-semibold ${isActive ? "text-primary" : "text-foreground"}`}>
                          Page {idx + 1}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              rotatePage(idx, "cw");
                            }}
                            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                            title="Rotate 90°"
                          >
                            <RotateCw className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            MODE 2: ANNOTATE & DRAW
            ======================================================== */}
        {mode === "annotate" && (
          <div className="space-y-4">
            <span className="font-bold text-foreground uppercase tracking-wider text-[10px] text-muted-foreground">
              Annotation Tool
            </span>

            {/* Tool Grid */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "highlight", label: "Highlight", icon: Highlighter },
                { id: "underline", label: "Underline", icon: UnderlineIcon },
                { id: "strike", label: "Strikethrough", icon: StrikeIcon },
                { id: "squiggly", label: "Squiggly Line", icon: Minus },
                { id: "draw", label: "Freehand Pen", icon: Pencil },
                { id: "sticky", label: "Sticky Note", icon: MessageSquare },
                { id: "shape-rect", label: "Rectangle", icon: Square },
                { id: "shape-circle", label: "Circle / Oval", icon: Circle },
                { id: "line", label: "Straight Line", icon: Minus },
                { id: "arrow", label: "Pointer Arrow", icon: MoveRight },
              ].map((toolItem) => {
                const Icon = toolItem.icon;
                const isSelected = activeTool === toolItem.id;
                return (
                  <button
                    key={toolItem.id}
                    onClick={() => setActiveTool(toolItem.id as EditorTool)}
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 font-medium transition-all ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground shadow-xs font-semibold"
                        : "border-border bg-card hover:bg-muted text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{toolItem.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Color Palette */}
            <div className="space-y-2 pt-2 border-t border-border">
              <span className="font-bold text-foreground uppercase tracking-wider text-[10px] text-muted-foreground">
                Color Palette
              </span>
              <div className="grid grid-cols-4 gap-2">
                {colors.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => onChangeColor(c.hex)}
                    className={`flex items-center gap-2 p-1.5 rounded-lg border text-left transition-all ${
                      activeColor === c.hex
                        ? "border-primary ring-2 ring-primary/20 bg-muted/60 font-semibold"
                        : "border-border hover:bg-muted/40"
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-[11px] truncate text-foreground">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Stroke Width */}
            <div className="space-y-2 pt-2 border-t border-border">
              <span className="font-bold text-foreground uppercase tracking-wider text-[10px] text-muted-foreground">
                Stroke Thickness
              </span>
              <div className="grid grid-cols-4 gap-2">
                {strokeWidths.map((w) => (
                  <button
                    key={w}
                    onClick={() => onChangeStrokeWidth(w)}
                    className={`py-1.5 rounded-lg border text-center font-medium transition-all ${
                      activeStrokeWidth === w
                        ? "border-primary bg-primary text-primary-foreground font-bold shadow-xs"
                        : "border-border bg-card hover:bg-muted text-foreground"
                    }`}
                  >
                    {w}px
                  </button>
                ))}
              </div>
            </div>

            {/* Annotations List */}
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground uppercase tracking-wider text-[10px] text-muted-foreground">
                  Annotations on Page {activePageIndex + 1} ({pageAnnotations.length})
                </span>
                {annotations.length > 0 && (
                  <button
                    onClick={() => onExportComments("txt")}
                    className="text-[11px] text-primary hover:underline font-semibold"
                  >
                    Export All
                  </button>
                )}
              </div>

              {pageAnnotations.length === 0 ? (
                <p className="text-muted-foreground text-[11px]">No annotations placed on this page yet.</p>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {pageAnnotations.map((ann) => (
                    <div
                      key={ann.id}
                      className="flex items-center justify-between p-2 rounded-lg border border-border bg-card hover:bg-muted/20"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ann.color }} />
                        <span className="font-medium capitalize">{ann.type}</span>
                        {ann.text && <span className="text-muted-foreground truncate max-w-[120px]">"{ann.text}"</span>}
                      </div>
                      <button
                        onClick={() => deleteAnnotation(ann.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            MODE 3: CONTENT & TEXT
            ======================================================== */}
        {mode === "content" && (
          <div className="space-y-4">
            <span className="font-bold text-foreground uppercase tracking-wider text-[10px] text-muted-foreground">
              Add or Replace Content
            </span>

            <div className="space-y-2">
              <button
                onClick={() => setActiveTool("text")}
                className={`w-full p-3 rounded-xl border flex items-center gap-3 font-medium transition-all ${
                  activeTool === "text"
                    ? "border-primary bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "border-border bg-card hover:bg-muted text-foreground"
                }`}
              >
                <Type className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <div className="font-semibold text-xs">Add New Vector Text</div>
                  <div className="text-[11px] opacity-80">Click anywhere on the document canvas to type</div>
                </div>
              </button>

              <button
                onClick={() => setActiveTool("whiteout")}
                className={`w-full p-3 rounded-xl border flex items-center gap-3 font-medium transition-all ${
                  activeTool === "whiteout"
                    ? "border-primary bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "border-border bg-card hover:bg-muted text-foreground"
                }`}
              >
                <Eraser className="w-5 h-5 text-amber-500" />
                <div className="text-left">
                  <div className="font-semibold text-xs">Whiteout Box (Cover Text)</div>
                  <div className="text-[11px] opacity-80">Drag a matching white box over text to replace it</div>
                </div>
              </button>

              <button
                onClick={onInsertImageClick}
                className="w-full p-3 rounded-xl border border-border bg-card hover:bg-muted flex items-center gap-3 font-medium text-foreground transition-all"
              >
                <ImageIcon className="w-5 h-5 text-blue-500" />
                <div className="text-left">
                  <div className="font-semibold text-xs">Insert Image (Logo / Graphic)</div>
                  <div className="text-[11px] text-muted-foreground">Upload PNG, JPG, or WebP picture</div>
                </div>
              </button>

              <button
                onClick={onOpenFindReplaceModal}
                className="w-full p-3 rounded-xl border border-border bg-card hover:bg-muted flex items-center gap-3 font-medium text-foreground transition-all"
              >
                <Replace className="w-5 h-5 text-purple-500" />
                <div className="text-left">
                  <div className="font-semibold text-xs">Find & Replace ("Add or replace text")</div>
                  <div className="text-[11px] text-muted-foreground">Batch replace matching text across all pages</div>
                </div>
              </button>
            </div>

            {/* Elements List */}
            <div className="space-y-2 pt-2 border-t border-border">
              <span className="font-bold text-foreground uppercase tracking-wider text-[10px] text-muted-foreground">
                Content Elements on Page {activePageIndex + 1} ({pageElements.length})
              </span>
              {pageElements.length === 0 ? (
                <p className="text-muted-foreground text-[11px]">No text or images added to this page yet.</p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {pageElements.map((el) => (
                    <div
                      key={el.id}
                      className="flex items-center justify-between p-2 rounded-lg border border-border bg-card"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{el.type}</span>
                        {el.text && <span className="text-muted-foreground truncate max-w-[130px]">"{el.text}"</span>}
                      </div>
                      <button
                        onClick={() => deleteElement(el.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            MODE 4: INTERACTIVE FORMS
            ======================================================== */}
        {mode === "forms" && (
          <div className="space-y-4">
            <span className="font-bold text-foreground uppercase tracking-wider text-[10px] text-muted-foreground">
              Form Field Tools
            </span>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "form-text", label: "Text Input", icon: Type },
                { id: "form-check", label: "Checkbox", icon: CheckSquare },
                { id: "form-radio", label: "Radio Button", icon: Radio },
                { id: "form-dropdown", label: "Dropdown", icon: ChevronDown },
                { id: "form-listbox", label: "List Box", icon: ListFilter },
                { id: "form-button", label: "Submit Button", icon: FileCheck },
              ].map((f) => {
                const Icon = f.icon;
                const isSelected = activeTool === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setActiveTool(f.id as EditorTool)}
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 font-medium transition-all ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground shadow-xs font-semibold"
                        : "border-border bg-card hover:bg-muted text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{f.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Form Field Inspector */}
            {selectedFormField ? (
              <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-blue-600">Selected Field Inspector</span>
                  <button
                    onClick={() => deleteFormField(selectedFormField.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-0.5">Field Name</label>
                    <input
                      type="text"
                      value={selectedFormField.name}
                      onChange={(e) => updateFormField(selectedFormField.id, { name: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-0.5">Default Value</label>
                    <input
                      type="text"
                      value={String(selectedFormField.defaultValue ?? "")}
                      onChange={(e) => updateFormField(selectedFormField.id, { defaultValue: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-[11px]">
                      <input
                        type="checkbox"
                        checked={Boolean(selectedFormField.isRequired)}
                        onChange={(e) => updateFormField(selectedFormField.id, { isRequired: e.target.checked })}
                        className="rounded text-primary"
                      />
                      <span>Required</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-[11px]">
                      <input
                        type="checkbox"
                        checked={Boolean(selectedFormField.isReadOnly)}
                        onChange={(e) => updateFormField(selectedFormField.id, { isReadOnly: e.target.checked })}
                        className="rounded text-primary"
                      />
                      <span>Read-Only</span>
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl border border-dashed border-border text-center text-muted-foreground text-[11px]">
                Click any form field on the canvas to inspect and edit its properties.
              </div>
            )}

            {/* Form Data Exchange */}
            <div className="space-y-2 pt-2 border-t border-border">
              <span className="font-bold text-foreground uppercase tracking-wider text-[10px] text-muted-foreground">
                Form Data Exchange & Flattening
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onExportFormData("json")}
                  className="p-2 rounded-lg border border-border hover:bg-muted font-medium text-foreground text-center"
                >
                  Export JSON
                </button>
                <button
                  onClick={() => onExportFormData("fdf")}
                  className="p-2 rounded-lg border border-border hover:bg-muted font-medium text-foreground text-center"
                >
                  Export Adobe FDF
                </button>
                <button
                  onClick={onImportFormDataClick}
                  className="p-2 rounded-lg border border-border hover:bg-muted font-medium text-foreground text-center"
                >
                  Import JSON
                </button>
                <button
                  onClick={() => onFlattenClick("forms")}
                  className="p-2 rounded-lg border border-border hover:bg-muted font-medium text-foreground text-center text-amber-600"
                >
                  Flatten Forms
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            MODE 5: PERMANENT REDACTION
            ======================================================== */}
        {mode === "redact" && (
          <div className="space-y-4">
            <span className="font-bold text-foreground uppercase tracking-wider text-[10px] text-muted-foreground">
              Permanent Vector Redaction
            </span>

            <div className="space-y-2">
              <button
                onClick={() => setActiveTool("redact-box")}
                className={`w-full p-3 rounded-xl border flex items-center gap-3 font-medium transition-all ${
                  activeTool === "redact-box"
                    ? "border-red-600 bg-red-600 text-white shadow-xs font-semibold"
                    : "border-border bg-card hover:bg-muted text-red-600"
                }`}
              >
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <div className="text-left">
                  <div className="font-semibold text-xs">Mark Redaction Box</div>
                  <div className="text-[11px] opacity-80">Drag an opaque rectangle over sensitive text or images</div>
                </div>
              </button>

              <button
                onClick={onOpenSearchRedact}
                className="w-full p-3 rounded-xl border border-border bg-card hover:bg-muted flex items-center gap-3 font-medium text-foreground transition-all"
              >
                <Search className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <div className="font-semibold text-xs">Search & Batch Redact</div>
                  <div className="text-[11px] text-muted-foreground">Find keywords and redact across all pages in one pass</div>
                </div>
              </button>
            </div>

            {/* Redactions list */}
            <div className="space-y-2 pt-2 border-t border-border">
              <span className="font-bold text-foreground uppercase tracking-wider text-[10px] text-muted-foreground">
                Marked Redactions on Page {activePageIndex + 1} ({pageRedactions.length})
              </span>
              {pageRedactions.length === 0 ? (
                <p className="text-muted-foreground text-[11px]">No redactions marked on this page yet.</p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {pageRedactions.map((red) => (
                    <div
                      key={red.id}
                      className="flex items-center justify-between p-2 rounded-lg border border-border bg-card"
                    >
                      <span className="font-mono text-red-600 font-bold truncate max-w-[150px]">
                        {red.label || "[REDACTED]"}
                      </span>
                      <button
                        onClick={() => deleteRedaction(red.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            MODE 6: FILL & SIGN
            ======================================================== */}
        {mode === "sign" && (
          <div className="space-y-4">
            <span className="font-bold text-foreground uppercase tracking-wider text-[10px] text-muted-foreground">
              Signatures & Execution
            </span>

            <div className="space-y-2">
              <button
                onClick={() => onOpenSignatureModal("draw")}
                className="w-full p-3 rounded-xl border border-border bg-card hover:bg-muted flex items-center gap-3 font-medium text-foreground transition-all"
              >
                <PenTool className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <div className="font-semibold text-xs">Draw Signature</div>
                  <div className="text-[11px] text-muted-foreground">Smooth freehand digital signature canvas</div>
                </div>
              </button>

              <button
                onClick={() => onOpenSignatureModal("type")}
                className="w-full p-3 rounded-xl border border-border bg-card hover:bg-muted flex items-center gap-3 font-medium text-foreground transition-all"
              >
                <Type className="w-5 h-5 text-blue-500" />
                <div className="text-left">
                  <div className="font-semibold text-xs">Type Cursive Calligraphy</div>
                  <div className="text-[11px] text-muted-foreground">Generates elegant cursive signature fonts</div>
                </div>
              </button>

              <button
                onClick={() => onOpenSignatureModal("upload")}
                className="w-full p-3 rounded-xl border border-border bg-card hover:bg-muted flex items-center gap-3 font-medium text-foreground transition-all"
              >
                <Upload className="w-5 h-5 text-purple-500" />
                <div className="text-left">
                  <div className="font-semibold text-xs">Upload Signature Image</div>
                  <div className="text-[11px] text-muted-foreground">Auto white-background transparency removal</div>
                </div>
              </button>

              <button
                onClick={() => onOpenSignatureModal("initials")}
                className="w-full p-3 rounded-xl border border-border bg-card hover:bg-muted flex items-center gap-3 font-medium text-foreground transition-all"
              >
                <FileSignature className="w-5 h-5 text-emerald-500" />
                <div className="text-left">
                  <div className="font-semibold text-xs">Add Initials</div>
                  <div className="text-[11px] text-muted-foreground">Compact initial stamps for multi-page initials</div>
                </div>
              </button>

              <button
                onClick={onAddDate}
                className="w-full p-3 rounded-xl border border-border bg-card hover:bg-muted flex items-center gap-3 font-medium text-foreground transition-all"
              >
                <Calendar className="w-5 h-5 text-amber-500" />
                <div className="text-left">
                  <div className="font-semibold text-xs">Add Today's Date Stamp</div>
                  <div className="text-[11px] text-muted-foreground">{new Date().toISOString().split("T")[0]}</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            MODE 7: STAMPS, NUMBERS & WATERMARK
            ======================================================== */}
        {mode === "stamp" && (
          <div className="space-y-4">
            {/* Approval Stamps */}
            <div className="space-y-2">
              <span className="font-bold text-foreground uppercase tracking-wider text-[10px] text-muted-foreground">
                Approval Stamps
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { text: "APPROVED", color: "#16a34a" },
                  { text: "CONFIDENTIAL", color: "#dc2626" },
                  { text: "DRAFT", color: "#eab308" },
                  { text: "FINAL", color: "#2563eb" },
                  { text: "VOID", color: "#9333ea" },
                  { text: "COPY", color: "#475569" },
                ].map((st) => (
                  <button
                    key={st.text}
                    onClick={() => onAddStamp(st.text, st.color)}
                    style={{ borderColor: st.color, color: st.color }}
                    className="p-2 rounded-xl border-2 font-black tracking-wider uppercase text-center bg-card hover:bg-muted/40 transition-transform hover:scale-102"
                  >
                    {st.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Watermark */}
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground uppercase tracking-wider text-[10px] text-muted-foreground">
                  Diagonal Watermark
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(watermark?.enabled)}
                  onChange={(e) =>
                    setWatermark(
                      e.target.checked
                        ? {
                            enabled: true,
                            text: watermark?.text || "CONFIDENTIAL",
                            color: watermark?.color || "#dc2626",
                            opacity: watermark?.opacity || 0.2,
                            fontSize: watermark?.fontSize || 48,
                            rotation: watermark?.rotation || 45,
                          }
                        : null
                    )
                  }
                  className="rounded text-primary"
                />
              </div>

              {watermark?.enabled && (
                <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-2.5">
                  <input
                    type="text"
                    value={watermark.text}
                    onChange={(e) => setWatermark({ ...watermark, text: e.target.value })}
                    placeholder="Watermark text..."
                    className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs font-semibold"
                  />
                  <div className="flex items-center justify-between text-[11px]">
                    <span>Opacity: {Math.round(watermark.opacity * 100)}%</span>
                    <input
                      type="range"
                      min="0.05"
                      max="0.8"
                      step="0.05"
                      value={watermark.opacity}
                      onChange={(e) => setWatermark({ ...watermark, opacity: parseFloat(e.target.value) })}
                      className="w-28"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Page Numbering */}
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground uppercase tracking-wider text-[10px] text-muted-foreground">
                  Page Numbering
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(pageNumbering?.enabled)}
                  onChange={(e) =>
                    setPageNumbering(
                      e.target.checked
                        ? {
                            enabled: true,
                            format: "page-of-total",
                            position: "bottom-center",
                            fontSize: 9,
                            color: "#475569",
                          }
                        : null
                    )
                  }
                  className="rounded text-primary"
                />
              </div>

              {pageNumbering?.enabled && (
                <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-2">
                  <Select
                    value={pageNumbering.format}
                    onValueChange={(val) => setPageNumbering({ ...pageNumbering, format: val as any })}
                  >
                    <SelectTrigger className="w-full h-8 text-xs bg-background border-border">
                      <SelectValue placeholder="Format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="page-of-total">Page 1 of {pages.length}</SelectItem>
                      <SelectItem value="simple">1 of {pages.length}</SelectItem>
                      <SelectItem value="page">Page 1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Legal Bates Stamping */}
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground uppercase tracking-wider text-[10px] text-muted-foreground">
                  Bates Stamping (Legal)
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(bates?.enabled)}
                  onChange={(e) =>
                    setBates(
                      e.target.checked
                        ? {
                            enabled: true,
                            prefix: "CASE-",
                            suffix: "",
                            startNumber: 1,
                            digits: 6,
                            position: "bottom-right",
                          }
                        : null
                    )
                  }
                  className="rounded text-primary"
                />
              </div>

              {bates?.enabled && (
                <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={bates.prefix}
                      onChange={(e) => setBates({ ...bates, prefix: e.target.value })}
                      placeholder="Prefix (e.g. DOC-)"
                      className="w-1/2 px-2 py-1 rounded border border-border bg-background text-xs font-mono"
                    />
                    <input
                      type="number"
                      value={bates.startNumber}
                      onChange={(e) => setBates({ ...bates, startNumber: parseInt(e.target.value, 10) || 1 })}
                      placeholder="Start #"
                      className="w-1/2 px-2 py-1 rounded border border-border bg-background text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            MODE 8: SECURITY & METADATA
            ======================================================== */}
        {mode === "security" && (
          <div className="space-y-4">
            <span className="font-bold text-foreground uppercase tracking-wider text-[10px] text-muted-foreground">
              Document Security & Cryptography
            </span>

            <button
              onClick={onOpenSecurityModal}
              className="w-full p-3 rounded-xl border border-primary bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow-xs"
            >
              <Lock className="w-4 h-4" />
              <span>Password Protection & Permissions</span>
            </button>

            {/* Metadata Fields */}
            <div className="space-y-2.5 pt-2 border-t border-border">
              <span className="font-bold text-foreground uppercase tracking-wider text-[10px] text-muted-foreground">
                Dublin Core Metadata
              </span>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-0.5">Document Title</label>
                <input
                  type="text"
                  value={metadata.title || ""}
                  onChange={(e) => setMetadata({ title: e.target.value })}
                  placeholder="e.g. Master Services Agreement"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-0.5">Author / Organization</label>
                <input
                  type="text"
                  value={metadata.author || ""}
                  onChange={(e) => setMetadata({ author: e.target.value })}
                  placeholder="e.g. Legal Operations"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-0.5">Keywords</label>
                <input
                  type="text"
                  value={metadata.keywords || ""}
                  onChange={(e) => setMetadata({ keywords: e.target.value })}
                  placeholder="confidential, agreement, 2026"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs"
                />
              </div>
            </div>

            {/* Flatten Engine */}
            <div className="space-y-2 pt-2 border-t border-border">
              <span className="font-bold text-foreground uppercase tracking-wider text-[10px] text-muted-foreground">
                Document Flattener
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onFlattenClick("forms")}
                  className="p-2 rounded-lg border border-border hover:bg-muted font-medium text-foreground"
                >
                  Flatten Forms
                </button>
                <button
                  onClick={() => onFlattenClick("annotations")}
                  className="p-2 rounded-lg border border-border hover:bg-muted font-medium text-foreground"
                >
                  Flatten Annotations
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            MODE 9: CONVERT & OCR
            ======================================================== */}
        {mode === "convert" && (
          <div className="space-y-4">
            <span className="font-bold text-foreground uppercase tracking-wider text-[10px] text-muted-foreground">
              Heavy Modules, Conversions & OCR
            </span>

            <div className="space-y-2">
              <button
                onClick={onOpenConvertModal}
                className="w-full p-3.5 rounded-xl border border-primary/40 bg-primary/10 hover:bg-primary/20 flex items-center gap-3 font-semibold text-primary transition-all"
              >
                <Sparkles className="w-5 h-5 shrink-0" />
                <div className="text-left">
                  <div className="text-xs font-bold">10 Document Format Converters</div>
                  <div className="text-[11px] opacity-80">Export to Word, Excel, PPTX, JPG, PNG, Text, HTML</div>
                </div>
              </button>

              <button
                onClick={onOpenOcrModal}
                className="w-full p-3.5 rounded-xl border border-border bg-card hover:bg-muted flex items-center gap-3 font-medium text-foreground transition-all"
              >
                <ScanText className="w-5 h-5 text-emerald-500 shrink-0" />
                <div className="text-left">
                  <div className="text-xs font-bold">Client-Side OCR Scanner</div>
                  <div className="text-[11px] text-muted-foreground">Extract text from scanned scans & make Searchable PDF</div>
                </div>
              </button>

              <button
                onClick={onOpenCompareModal}
                className="w-full p-3.5 rounded-xl border border-border bg-card hover:bg-muted flex items-center gap-3 font-medium text-foreground transition-all"
              >
                <GitCompare className="w-5 h-5 text-blue-500 shrink-0" />
                <div className="text-left">
                  <div className="text-xs font-bold">Compare Two PDF Revisions</div>
                  <div className="text-[11px] text-muted-foreground">Visual side-by-side & pixel diff heatmap comparison</div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
