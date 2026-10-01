import { create } from "zustand";
import {
  EditorMode,
  EditorTool,
  PageMeta,
  AnnotationObject,
  ContentElement,
  FormFieldDef,
  RedactionItem,
  PdfMetadata,
  SecurityConfig,
  WatermarkConfig,
  PageNumberConfig,
  BatesConfig,
  HeaderFooterConfig,
  PageBackgroundConfig,
  DocumentHistoryEntry,
} from "./types";

interface PdfEditorStore {
  // Document State
  pdfBytes: Uint8Array | null;
  fileName: string;
  fileSize: number;
  pages: PageMeta[];
  activePageIndex: number;
  zoom: number;
  mode: EditorMode;
  activeTool: EditorTool;

  // Selected object
  selectedObjectId: string | null;
  selectedObjectType: "annotation" | "element" | "formField" | "redaction" | null;

  // Annotations & Elements (Tier 1)
  annotations: AnnotationObject[];
  elements: ContentElement[];

  // Tier 2: Interactive Forms & Redaction & Security
  formFields: FormFieldDef[];
  redactions: RedactionItem[];
  metadata: PdfMetadata;
  security: SecurityConfig;
  isFlattened: boolean;

  // Global Stamping Configs
  watermark: WatermarkConfig | null;
  pageNumbering: PageNumberConfig | null;
  bates: BatesConfig | null;
  headerFooter: HeaderFooterConfig | null;
  pageBackground: PageBackgroundConfig | null;

  // History Stack (Undo / Redo)
  past: DocumentHistoryEntry[];
  future: DocumentHistoryEntry[];

  // Action Dispatchers
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Document Management
  setDocument: (bytes: Uint8Array, fileName: string, fileSize: number, pages: PageMeta[]) => void;
  resetDocument: () => void;
  setActivePageIndex: (index: number) => void;
  setZoom: (zoom: number) => void;
  setMode: (mode: EditorMode) => void;
  setActiveTool: (tool: EditorTool) => void;
  selectObject: (id: string | null, type?: "annotation" | "element" | "formField" | "redaction" | null) => void;

  // Page Operations (Tier 1: 12 functions)
  reorderPages: (fromIndex: number, toIndex: number) => void;
  rotatePage: (pageIndex: number, direction: "cw" | "ccw") => void;
  rotateAllPages: (direction: "cw" | "ccw") => void;
  deletePage: (pageIndex: number) => void;
  duplicatePage: (pageIndex: number) => void;
  insertBlankPage: (afterIndex: number) => void;
  insertPages: (afterIndex: number, newPages: PageMeta[]) => void;
  deletePages: (indices: number[]) => void;
  cropPage: (pageIndex: number, cropBox: { x: number; y: number; width: number; height: number } | null) => void;
  setPageLabel: (pageIndex: number, label: string) => void;
  updatePageThumbnail: (pageIndex: number, thumbnailUrl: string) => void;

  // Annotations (Tier 1: 10 functions)
  addAnnotation: (annotation: AnnotationObject) => void;
  updateAnnotation: (id: string, updates: Partial<AnnotationObject>) => void;
  deleteAnnotation: (id: string) => void;

  // Content Elements (Tier 1: 8 functions)
  addElement: (element: ContentElement) => void;
  updateElement: (id: string, updates: Partial<ContentElement>) => void;
  deleteElement: (id: string) => void;

  // Stamping (Tier 1: 5 functions)
  setWatermark: (config: WatermarkConfig | null) => void;
  setPageNumbering: (config: PageNumberConfig | null) => void;
  setBates: (config: BatesConfig | null) => void;
  setHeaderFooter: (config: HeaderFooterConfig | null) => void;
  setPageBackground: (config: PageBackgroundConfig | null) => void;

  // Tier 2: Forms (10 functions)
  addFormField: (field: FormFieldDef) => void;
  updateFormField: (id: string, updates: Partial<FormFieldDef>) => void;
  deleteFormField: (id: string) => void;
  setFormFields: (fields: FormFieldDef[]) => void;
  importFormData: (formData: Record<string, any>) => void;

  // Tier 2: Redaction (4 functions)
  addRedaction: (redaction: RedactionItem) => void;
  updateRedaction: (id: string, updates: Partial<RedactionItem>) => void;
  deleteRedaction: (id: string) => void;
  applyAllRedactions: () => void;

  // Tier 2: Flattener (2 functions)
  flattenDocument: (target: "annotations" | "forms" | "all") => void;

  // Tier 2: Security & Metadata (4 functions)
  setMetadata: (metadata: Partial<PdfMetadata>) => void;
  setSecurity: (security: Partial<SecurityConfig>) => void;
}

export const usePdfEditorStore = create<PdfEditorStore>((set, get) => {
  const getSnapshot = (): DocumentHistoryEntry => {
    const state = get();
    return {
      pages: JSON.parse(JSON.stringify(state.pages)),
      annotations: JSON.parse(JSON.stringify(state.annotations)),
      elements: JSON.parse(JSON.stringify(state.elements)),
      formFields: JSON.parse(JSON.stringify(state.formFields)),
      redactions: JSON.parse(JSON.stringify(state.redactions)),
      metadata: { ...state.metadata },
      security: {
        isEncrypted: state.security.isEncrypted,
        userPassword: state.security.userPassword,
        permissions: { ...state.security.permissions },
      },
      isFlattened: state.isFlattened,
      watermark: state.watermark ? { ...state.watermark } : null,
      pageNumbering: state.pageNumbering ? { ...state.pageNumbering } : null,
      bates: state.bates ? { ...state.bates } : null,
      headerFooter: state.headerFooter ? { ...state.headerFooter } : null,
      pageBackground: state.pageBackground ? { ...state.pageBackground } : null,
    };
  };

  return {
    pdfBytes: null,
    fileName: "",
    fileSize: 0,
    pages: [],
    activePageIndex: 0,
    zoom: 1,
    mode: "organize",
    activeTool: "select",
    selectedObjectId: null,
    selectedObjectType: null,
    annotations: [],
    elements: [],
    formFields: [],
    redactions: [],
    metadata: {
      title: "",
      author: "",
      subject: "",
      keywords: "",
      creator: "ClearTrix Privacy PDF Suite",
      producer: "pdf-lib (In-Browser Client)",
    },
    security: {
      isEncrypted: false,
      userPassword: "",
      permissions: {
        allowPrinting: true,
        allowCopying: true,
        allowModifying: true,
        allowAnnotating: true,
      },
    },
    isFlattened: false,
    watermark: null,
    pageNumbering: null,
    bates: null,
    headerFooter: null,
    pageBackground: null,
    past: [],
    future: [],

    pushHistory: () => {
      const snap = getSnapshot();
      set((state) => ({
        past: [...state.past.slice(-49), snap],
        future: [],
      }));
    },

    undo: () => {
      const { past, future } = get();
      if (past.length === 0) return;
      const current = getSnapshot();
      const previous = past[past.length - 1];
      if (!previous) return;
      const newPast = past.slice(0, past.length - 1);

      set({
        pages: previous.pages,
        annotations: previous.annotations,
        elements: previous.elements,
        formFields: previous.formFields,
        redactions: previous.redactions,
        metadata: previous.metadata,
        security: previous.security,
        isFlattened: previous.isFlattened,
        watermark: previous.watermark,
        pageNumbering: previous.pageNumbering,
        bates: previous.bates,
        headerFooter: previous.headerFooter,
        pageBackground: previous.pageBackground,
        past: newPast,
        future: [current, ...future],
      });
    },

    redo: () => {
      const { past, future } = get();
      if (future.length === 0) return;
      const current = getSnapshot();
      const next = future[0];
      if (!next) return;
      const newFuture = future.slice(1);

      set({
        pages: next.pages,
        annotations: next.annotations,
        elements: next.elements,
        formFields: next.formFields,
        redactions: next.redactions,
        metadata: next.metadata,
        security: next.security,
        isFlattened: next.isFlattened,
        watermark: next.watermark,
        pageNumbering: next.pageNumbering,
        bates: next.bates,
        headerFooter: next.headerFooter,
        pageBackground: next.pageBackground,
        past: [...past, current],
        future: newFuture,
      });
    },

    canUndo: () => get().past.length > 0,
    canRedo: () => get().future.length > 0,

    setDocument: (bytes, fileName, fileSize, pages) => {
      set({
        pdfBytes: bytes,
        fileName,
        fileSize,
        pages,
        activePageIndex: 0,
        annotations: [],
        elements: [],
        formFields: [],
        redactions: [],
        selectedObjectId: null,
        selectedObjectType: null,
        past: [],
        future: [],
      });
    },

    resetDocument: () => {
      set({
        pdfBytes: null,
        fileName: "",
        fileSize: 0,
        pages: [],
        activePageIndex: 0,
        annotations: [],
        elements: [],
        formFields: [],
        redactions: [],
        selectedObjectId: null,
        selectedObjectType: null,
        past: [],
        future: [],
      });
    },

    setActivePageIndex: (activePageIndex) => set({ activePageIndex, selectedObjectId: null }),
    setZoom: (zoom) => set({ zoom }),
    setMode: (mode) => set({ mode }),
    setActiveTool: (activeTool) => set({ activeTool }),
    selectObject: (id, type = null) => set({ selectedObjectId: id, selectedObjectType: type }),

    reorderPages: (fromIndex, toIndex) => {
      get().pushHistory();
      const newPages = [...get().pages];
      const [moved] = newPages.splice(fromIndex, 1);
      if (moved) {
        newPages.splice(toIndex, 0, moved);
      }
      const renumbered = newPages.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
      set({ pages: renumbered, activePageIndex: toIndex });
    },

    rotatePage: (pageIndex, direction) => {
      get().pushHistory();
      const newPages = [...get().pages];
      const target = newPages[pageIndex];
      if (!target) return;
      const delta = direction === "cw" ? 90 : 270;
      const newRotation = ((target.rotation + delta) % 360) as 0 | 90 | 180 | 270;
      newPages[pageIndex] = { ...target, rotation: newRotation };
      set({ pages: newPages });
    },

    rotateAllPages: (direction) => {
      get().pushHistory();
      const delta = direction === "cw" ? 90 : 270;
      const newPages = get().pages.map((p) => ({
        ...p,
        rotation: ((p.rotation + delta) % 360) as 0 | 90 | 180 | 270,
      }));
      set({ pages: newPages });
    },

    deletePage: (pageIndex) => {
      if (get().pages.length <= 1) return;
      get().pushHistory();
      const newPages = get().pages.filter((_, idx) => idx !== pageIndex);
      const renumbered = newPages.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
      const newActiveIdx = Math.min(get().activePageIndex, renumbered.length - 1);
      set({ pages: renumbered, activePageIndex: newActiveIdx });
    },

    duplicatePage: (pageIndex) => {
      get().pushHistory();
      const source = get().pages[pageIndex];
      if (!source) return;
      const clone: PageMeta = {
        ...source,
        id: `page-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        label: `${source.label || `Page ${pageIndex + 1}`} (Copy)`,
      };
      const newPages = [...get().pages];
      newPages.splice(pageIndex + 1, 0, clone);
      const renumbered = newPages.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
      set({ pages: renumbered, activePageIndex: pageIndex + 1 });
    },

    insertBlankPage: (afterIndex) => {
      get().pushHistory();
      const prevPage = get().pages[afterIndex];
      const width = prevPage ? prevPage.width : 595.28;
      const height = prevPage ? prevPage.height : 841.89;

      const blankPage: PageMeta = {
        id: `blank-${Date.now()}`,
        pageNumber: afterIndex + 2,
        originalIndex: -1,
        width,
        height,
        rotation: 0,
        label: `Blank Page`,
      };

      const newPages = [...get().pages];
      newPages.splice(afterIndex + 1, 0, blankPage);
      const renumbered = newPages.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
      set({ pages: renumbered, activePageIndex: afterIndex + 1 });
    },

    insertPages: (afterIndex, incomingPages) => {
      get().pushHistory();
      const newPages = [...get().pages];
      newPages.splice(afterIndex + 1, 0, ...incomingPages);
      const renumbered = newPages.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
      set({ pages: renumbered });
    },

    deletePages: (indices) => {
      if (get().pages.length <= indices.length) return;
      get().pushHistory();
      const toDelete = new Set(indices);
      const newPages = get().pages.filter((_, idx) => !toDelete.has(idx));
      const renumbered = newPages.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
      set({ pages: renumbered, activePageIndex: Math.min(get().activePageIndex, renumbered.length - 1) });
    },

    cropPage: (pageIndex, cropBox) => {
      get().pushHistory();
      const newPages = [...get().pages];
      const target = newPages[pageIndex];
      if (!target) return;
      newPages[pageIndex] = { ...target, cropBox };
      set({ pages: newPages });
    },

    setPageLabel: (pageIndex, label) => {
      get().pushHistory();
      const newPages = [...get().pages];
      const target = newPages[pageIndex];
      if (!target) return;
      newPages[pageIndex] = { ...target, label };
      set({ pages: newPages });
    },

    updatePageThumbnail: (pageIndex, thumbnailUrl) => {
      const newPages = [...get().pages];
      const target = newPages[pageIndex];
      if (!target) return;
      newPages[pageIndex] = { ...target, thumbnailUrl };
      set({ pages: newPages });
    },

    addAnnotation: (annotation) => {
      get().pushHistory();
      set((state) => ({
        annotations: [...state.annotations, annotation],
        selectedObjectId: annotation.id,
        selectedObjectType: "annotation",
      }));
    },

    updateAnnotation: (id, updates) => {
      get().pushHistory();
      set((state) => ({
        annotations: state.annotations.map((a) => (a.id === id ? { ...a, ...updates } : a)),
      }));
    },

    deleteAnnotation: (id) => {
      get().pushHistory();
      set((state) => ({
        annotations: state.annotations.filter((a) => a.id !== id),
        selectedObjectId: state.selectedObjectId === id ? null : state.selectedObjectId,
        selectedObjectType: state.selectedObjectId === id ? null : state.selectedObjectType,
      }));
    },

    addElement: (element) => {
      get().pushHistory();
      set((state) => ({
        elements: [...state.elements, element],
        selectedObjectId: element.id,
        selectedObjectType: "element",
      }));
    },

    updateElement: (id, updates) => {
      get().pushHistory();
      set((state) => ({
        elements: state.elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
      }));
    },

    deleteElement: (id) => {
      get().pushHistory();
      set((state) => ({
        elements: state.elements.filter((el) => el.id !== id),
        selectedObjectId: state.selectedObjectId === id ? null : state.selectedObjectId,
        selectedObjectType: state.selectedObjectId === id ? null : state.selectedObjectType,
      }));
    },

    setWatermark: (watermark) => {
      get().pushHistory();
      set({ watermark });
    },

    setPageNumbering: (pageNumbering) => {
      get().pushHistory();
      set({ pageNumbering });
    },

    setBates: (bates) => {
      get().pushHistory();
      set({ bates });
    },

    setHeaderFooter: (headerFooter) => {
      get().pushHistory();
      set({ headerFooter });
    },

    setPageBackground: (pageBackground) => {
      get().pushHistory();
      set({ pageBackground });
    },

    // --- TIER 2: FORMS ---
    addFormField: (field) => {
      get().pushHistory();
      set((state) => ({
        formFields: [...state.formFields, field],
        selectedObjectId: field.id,
        selectedObjectType: "formField",
      }));
    },

    updateFormField: (id, updates) => {
      get().pushHistory();
      set((state) => ({
        formFields: state.formFields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
      }));
    },

    deleteFormField: (id) => {
      get().pushHistory();
      set((state) => ({
        formFields: state.formFields.filter((f) => f.id !== id),
        selectedObjectId: state.selectedObjectId === id ? null : state.selectedObjectId,
        selectedObjectType: state.selectedObjectId === id ? null : state.selectedObjectType,
      }));
    },

    setFormFields: (formFields) => {
      get().pushHistory();
      set({ formFields });
    },

    importFormData: (formData) => {
      get().pushHistory();
      set((state) => ({
        formFields: state.formFields.map((f) => {
          if (formData[f.name] !== undefined) {
            return { ...f, value: formData[f.name] };
          }
          return f;
        }),
      }));
    },

    // --- TIER 2: REDACTION ---
    addRedaction: (redaction) => {
      get().pushHistory();
      set((state) => ({
        redactions: [...state.redactions, redaction],
        selectedObjectId: redaction.id,
        selectedObjectType: "redaction",
      }));
    },

    updateRedaction: (id, updates) => {
      get().pushHistory();
      set((state) => ({
        redactions: state.redactions.map((r) => (r.id === id ? { ...r, ...updates } : r)),
      }));
    },

    deleteRedaction: (id) => {
      get().pushHistory();
      set((state) => ({
        redactions: state.redactions.filter((r) => r.id !== id),
        selectedObjectId: state.selectedObjectId === id ? null : state.selectedObjectId,
        selectedObjectType: state.selectedObjectId === id ? null : state.selectedObjectType,
      }));
    },

    applyAllRedactions: () => {
      get().pushHistory();
      set((state) => ({
        redactions: state.redactions.map((r) => ({ ...r, applied: true })),
      }));
    },

    // --- TIER 2: FLATTENER ---
    flattenDocument: (target) => {
      get().pushHistory();
      set((state) => {
        let newAnns = state.annotations;
        let newFields = state.formFields;
        if (target === "annotations" || target === "all") {
          newAnns = [];
        }
        if (target === "forms" || target === "all") {
          newFields = [];
        }
        return {
          isFlattened: true,
          annotations: newAnns,
          formFields: newFields,
          selectedObjectId: null,
          selectedObjectType: null,
        };
      });
    },

    // --- TIER 2: SECURITY & METADATA ---
    setMetadata: (metadata) => {
      get().pushHistory();
      set((state) => ({
        metadata: { ...state.metadata, ...metadata },
      }));
    },

    setSecurity: (security) => {
      get().pushHistory();
      set((state) => ({
        security: {
          ...state.security,
          ...security,
          permissions: {
            ...state.security.permissions,
            ...(security.permissions || {}),
          },
        },
      }));
    },
  };
});
