import { create } from "zustand";
import {
  EditorMode,
  EditorTool,
  PageMeta,
  AnnotationObject,
  ContentElement,
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
  selectedObjectType: "annotation" | "element" | null;

  // Annotations & Elements
  annotations: AnnotationObject[];
  elements: ContentElement[];

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
  selectObject: (id: string | null, type?: "annotation" | "element" | null) => void;

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
}

export const usePdfEditorStore = create<PdfEditorStore>((set, get) => {
  const getSnapshot = (): DocumentHistoryEntry => {
    const state = get();
    return {
      pages: JSON.parse(JSON.stringify(state.pages)),
      annotations: JSON.parse(JSON.stringify(state.annotations)),
      elements: JSON.parse(JSON.stringify(state.elements)),
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
    zoom: 1.0,
    mode: "organize",
    activeTool: "select",
    selectedObjectId: null,
    selectedObjectType: null,
    annotations: [],
    elements: [],
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

    canUndo: () => get().past.length > 0,
    canRedo: () => get().future.length > 0,

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
        watermark: next.watermark,
        pageNumbering: next.pageNumbering,
        bates: next.bates,
        headerFooter: next.headerFooter,
        pageBackground: next.pageBackground,
        past: [...past, current],
        future: newFuture,
      });
    },

    setDocument: (bytes, fileName, fileSize, pages) => {
      set({
        pdfBytes: bytes,
        fileName,
        fileSize,
        pages,
        activePageIndex: 0,
        annotations: [],
        elements: [],
        watermark: null,
        pageNumbering: null,
        bates: null,
        headerFooter: null,
        pageBackground: null,
        past: [],
        future: [],
        selectedObjectId: null,
        selectedObjectType: null,
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
        watermark: null,
        pageNumbering: null,
        bates: null,
        headerFooter: null,
        pageBackground: null,
        past: [],
        future: [],
        selectedObjectId: null,
        selectedObjectType: null,
      });
    },

    setActivePageIndex: (index) => set({ activePageIndex: index }),
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
        rotation: (((p.rotation + delta) % 360) as 0 | 90 | 180 | 270),
      }));
      set({ pages: newPages });
    },

    deletePage: (pageIndex) => {
      if (get().pages.length <= 1) return; // Keep at least one page
      get().pushHistory();
      const newPages = get().pages.filter((_, idx) => idx !== pageIndex);
      const renumbered = newPages.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
      const newActive = Math.min(get().activePageIndex, renumbered.length - 1);
      set({ pages: renumbered, activePageIndex: newActive });
    },

    duplicatePage: (pageIndex) => {
      get().pushHistory();
      const source = get().pages[pageIndex];
      if (!source) return;
      const duplicated: PageMeta = {
        ...source,
        id: "page-" + Math.random().toString(36).substring(2, 9),
      };
      const newPages = [...get().pages];
      newPages.splice(pageIndex + 1, 0, duplicated);
      const renumbered = newPages.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
      set({ pages: renumbered, activePageIndex: pageIndex + 1 });
    },

    insertBlankPage: (afterIndex) => {
      get().pushHistory();
      const current = get().pages[afterIndex] || get().pages[0];
      const blankPage: PageMeta = {
        id: "blank-" + Math.random().toString(36).substring(2, 9),
        pageNumber: afterIndex + 2,
        originalIndex: -1,
        width: current ? current.width : 595.28,
        height: current ? current.height : 841.89,
        rotation: 0,
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
      set({ pages: renumbered, activePageIndex: afterIndex + 1 });
    },

    deletePages: (indices) => {
      if (get().pages.length <= indices.length) return;
      get().pushHistory();
      const toDelete = new Set(indices);
      const newPages = get().pages.filter((_, idx) => !toDelete.has(idx));
      const renumbered = newPages.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
      const newActive = Math.min(get().activePageIndex, renumbered.length - 1);
      set({ pages: renumbered, activePageIndex: newActive });
    },

    cropPage: (pageIndex, cropBox) => {
      get().pushHistory();
      const newPages = [...get().pages];
      if (!newPages[pageIndex]) return;
      newPages[pageIndex] = { ...newPages[pageIndex], cropBox };
      set({ pages: newPages });
    },

    setPageLabel: (pageIndex, label) => {
      get().pushHistory();
      const newPages = [...get().pages];
      if (!newPages[pageIndex]) return;
      newPages[pageIndex] = { ...newPages[pageIndex], label };
      set({ pages: newPages });
    },

    updatePageThumbnail: (pageIndex, thumbnailUrl) => {
      const newPages = [...get().pages];
      if (!newPages[pageIndex]) return;
      newPages[pageIndex] = { ...newPages[pageIndex], thumbnailUrl };
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
  };
});
