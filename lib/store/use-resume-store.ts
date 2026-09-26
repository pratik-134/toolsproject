import { create } from "zustand";
import {
  ResumeData,
  initialResumeData,
  resumeDataSchema,
  PersonalInfo,
  Section,
  SectionType,
  ThemeConfig,
  ResumeMeta,
  ExperienceItem,
  EducationItem,
  SkillItem,
  ProjectItem,
} from "../schema";
import { useResumeIndexStore } from "./use-resume-index-store";
import {
  getResumeStorageKey,
  safeLocalStorageGet,
  safeLocalStorageSet,
  LEGACY_STORAGE_KEY,
} from "./storage-utils";

const STORAGE_KEY = LEGACY_STORAGE_KEY;
const MAX_HISTORY_LENGTH = 30;

let saveTimeout: NodeJS.Timeout | null = null;

export interface ResumeStoreState {
  resumeData: ResumeData;
  past: ResumeData[];
  future: ResumeData[];
  saveStatus: "saved" | "saving" | "unsaved";
  lastSavedAt: string | null;
  activeSectionId: string | null;
  zoomLevel: number; // 50 to 150 percent

  // History Actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Editor UI State
  setActiveSectionId: (id: string | null) => void;
  setZoomLevel: (zoom: number) => void;
  isDebugMode: boolean;
  toggleDebugMode: () => void;
  isFocusMode: boolean;
  toggleFocusMode: () => void;
  isPageSettingsOpen: boolean;
  setPageSettingsOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  isAtsAuditOpen: boolean;
  setAtsAuditOpen: (open: boolean) => void;
  isOutlineOpen: boolean;
  toggleOutline: () => void;
  isPdfSplitView: boolean;
  togglePdfSplitView: () => void;
  isInlineEditMode: boolean;
  toggleInlineEditMode: () => void;
  selectedPreviewField: string | null;
  setSelectedPreviewField: (field: string | null) => void;
  isImportModalOpen: boolean;
  setImportModalOpen: (open: boolean) => void;
  isTemplatePickerOpen: boolean;
  setTemplatePickerOpen: (open: boolean) => void;

  // Data Actions
  updateTitle: (title: string) => void;
  updatePersonalInfo: (data: Partial<PersonalInfo>) => void;
  updateTheme: (theme: Partial<ThemeConfig>) => void;
  updateMeta: (meta: Partial<ResumeMeta>) => void;
  importResume: (data: ResumeData) => void;

  // Section Actions
  addSection: (type: SectionType, title?: string) => void;
  removeSection: (sectionId: string) => void;
  toggleSectionVisibility: (sectionId: string) => void;
  toggleSectionLock: (sectionId: string) => void;
  duplicateSection: (sectionId: string) => void;
  moveSection: (sectionId: string, direction: "up" | "down") => void;
  updateSectionTitle: (sectionId: string, title: string) => void;
  reorderSections: (newSections: Section[]) => void;

  // Item Actions
  addSectionItem: (sectionId: string, itemTemplate?: any) => void;
  updateSectionItem: (sectionId: string, itemId: string, data: any) => void;
  removeSectionItem: (sectionId: string, itemId: string) => void;
  duplicateSectionItem: (sectionId: string, itemId: string) => void;
  moveSectionItem: (sectionId: string, itemId: string, direction: "up" | "down") => void;
  reorderSectionItems: (sectionId: string, startIndex: number, endIndex: number) => void;

  // Bulk / Utility
  setResumeData: (data: ResumeData) => void;
  resetToDefault: () => void;
  triggerSave: () => void;
  activeResumeId: string | null;
  isStorageQuotaExceeded: boolean;
  loadResume: (id: string) => boolean;
  setStorageQuotaExceeded: (exceeded: boolean) => void;
}

// Helper to push history state
function recordHistory(state: ResumeStoreState): { past: ResumeData[]; future: ResumeData[] } {
  const newPast = [...state.past, state.resumeData].slice(-MAX_HISTORY_LENGTH);
  return { past: newPast, future: [] };
}

// Helper to calculate completeness score
export function calculateCompleteness(data: ResumeData): number {
  let score = 0;
  if (data.personalInfo.fullName.trim()) score += 15;
  if (data.personalInfo.title.trim()) score += 10;
  if (data.personalInfo.email.trim()) score += 10;
  if (data.personalInfo.phone.trim()) score += 5;
  if (data.personalInfo.summary.trim()) score += 15;

  const expSection = data.sections.find((s) => s.type === "experience");
  if (expSection && expSection.items.length > 0) score += 20;

  const eduSection = data.sections.find((s) => s.type === "education");
  if (eduSection && eduSection.items.length > 0) score += 10;

  const skSection = data.sections.find((s) => s.type === "skills");
  if (skSection && skSection.items.length > 0) score += 15;

  return Math.min(100, score);
}

// Helper to get initial state from localStorage safely
function getInitialData(): ResumeData {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.personalInfo && Array.isArray(parsed.sections)) {
          if (parsed.theme?.accentColor && (parsed.theme.accentColor.toLowerCase() === "#4f46e5" || parsed.theme.accentColor.toLowerCase() === "#16a34a")) {
            parsed.theme.accentColor = "#2563EB";
          }
          return parsed;
        }
      }
    } catch {
      // Fallback on JSON parse error
    }
  }
  return initialResumeData;
}

export const useResumeStore = create<ResumeStoreState>((set, get) => ({
  resumeData: getInitialData(),
  activeResumeId: null,
  isStorageQuotaExceeded: false,
  setStorageQuotaExceeded: (exceeded) => set({ isStorageQuotaExceeded: exceeded }),
  past: [],
  future: [],
  saveStatus: "saved",
  lastSavedAt: new Date().toLocaleTimeString(),
  activeSectionId: null,
  zoomLevel: 100,

  loadResume: (id: string) => {
    if (typeof window === "undefined") return false;
    const resumeKey = getResumeStorageKey(id);
    const raw = safeLocalStorageGet(resumeKey);
    if (!raw) return false;
    try {
      const parsed = JSON.parse(raw);
      const validation = resumeDataSchema.safeParse(parsed);
      const data = validation.success ? validation.data : (parsed as ResumeData);
      if (data.theme?.accentColor && (data.theme.accentColor.toLowerCase() === "#4f46e5" || data.theme.accentColor.toLowerCase() === "#16a34a")) {
        data.theme.accentColor = "#2563EB";
      }
      set({
        resumeData: data,
        activeResumeId: id,
        past: [], // Reset history so undo doesn't leak between resumes!
        future: [],
        saveStatus: "saved",
        lastSavedAt: new Date().toLocaleTimeString(),
      });
      useResumeIndexStore.getState().setActiveResumeId(id);
      return true;
    } catch {
      return false;
    }
  },

  // Advanced Editor UI State
  isDebugMode: false,
  toggleDebugMode: () => set((state) => ({ isDebugMode: !state.isDebugMode })),
  isFocusMode: false,
  toggleFocusMode: () => set((state) => ({ isFocusMode: !state.isFocusMode })),
  isPageSettingsOpen: false,
  setPageSettingsOpen: (open) => set({ isPageSettingsOpen: open }),
  isCommandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  isAtsAuditOpen: false,
  setAtsAuditOpen: (open) => set({ isAtsAuditOpen: open }),
  isOutlineOpen: false,
  toggleOutline: () => set((state) => ({ isOutlineOpen: !state.isOutlineOpen })),
  isPdfSplitView: false,
  togglePdfSplitView: () => set((state) => ({ isPdfSplitView: !state.isPdfSplitView })),
  isInlineEditMode: false,
  toggleInlineEditMode: () => set((state) => ({ isInlineEditMode: !state.isInlineEditMode })),
  selectedPreviewField: null,
  setSelectedPreviewField: (field) => set({ selectedPreviewField: field }),
  isImportModalOpen: false,
  setImportModalOpen: (open) => set({ isImportModalOpen: open }),
  isTemplatePickerOpen: false,
  setTemplatePickerOpen: (open) => set({ isTemplatePickerOpen: open }),

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  undo: () => {
    const { past, resumeData, future } = get();
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    if (!previous) return;
    const newPast = past.slice(0, past.length - 1);
    set({
      resumeData: previous,
      past: newPast,
      future: [resumeData, ...future],
      saveStatus: "saving",
    });
    get().triggerSave();
  },

  redo: () => {
    const { past, resumeData, future } = get();
    if (future.length === 0) return;
    const next = future[0];
    if (!next) return;
    const newFuture = future.slice(1);
    set({
      resumeData: next,
      past: [...past, resumeData],
      future: newFuture,
      saveStatus: "saving",
    });
    get().triggerSave();
  },

  setActiveSectionId: (id) => set({ activeSectionId: id }),
  setZoomLevel: (zoom) => set({ zoomLevel: Math.max(50, Math.min(150, zoom)) }),

  updateTitle: (title: string) => {
    set((state) => ({
      ...recordHistory(state),
      resumeData: { ...state.resumeData, title },
      saveStatus: "saving",
    }));
    const activeId = get().activeResumeId;
    if (activeId) {
      useResumeIndexStore.getState().renameResume(activeId, title);
    }
    get().triggerSave();
  },

  updatePersonalInfo: (data) => {
    set((state) => {
      const updatedPersonalInfo = { ...state.resumeData.personalInfo, ...data };
      const updatedData = {
        ...state.resumeData,
        personalInfo: updatedPersonalInfo,
        meta: {
          ...state.resumeData.meta,
          lastEditedAt: new Date().toISOString(),
          completenessScore: calculateCompleteness({
            ...state.resumeData,
            personalInfo: updatedPersonalInfo,
          }),
        },
      };
      return {
        ...recordHistory(state),
        resumeData: updatedData,
        saveStatus: "saving",
      };
    });
    get().triggerSave();
  },

  updateTheme: (theme) => {
    set((state) => ({
      ...recordHistory(state),
      resumeData: {
        ...state.resumeData,
        theme: { ...state.resumeData.theme, ...theme },
      },
      saveStatus: "saving",
    }));
    get().triggerSave();
  },

  updateMeta: (meta) => {
    set((state) => ({
      ...recordHistory(state),
      resumeData: {
        ...state.resumeData,
        meta: { ...state.resumeData.meta, ...meta },
      },
      saveStatus: "saving",
    }));
    get().triggerSave();
  },

  addSection: (type, title) => {
    set((state) => {
      const id = `sec-${type}-${Date.now()}`;
      const defaultTitles: Record<SectionType, string> = {
        experience: "Work Experience",
        education: "Education",
        skills: "Skills & Proficiencies",
        projects: "Projects",
        certifications: "Certifications",
        languages: "Languages",
        awards: "Honors & Awards",
        publications: "Publications",
        volunteer: "Volunteering",
        interests: "Interests & Hobbies",
        references: "References",
        custom: "Additional Information",
      };

      const newSection: Section = {
        id,
        type,
        title: title || defaultTitles[type] || "Section",
        visible: true,
        order: state.resumeData.sections.length,
        items: [],
      } as Section;

      return {
        ...recordHistory(state),
        resumeData: {
          ...state.resumeData,
          sections: [...state.resumeData.sections, newSection],
        },
        activeSectionId: id,
        saveStatus: "saving",
      };
    });
    get().triggerSave();
  },

  removeSection: (sectionId) => {
    set((state) => ({
      ...recordHistory(state),
      resumeData: {
        ...state.resumeData,
        sections: state.resumeData.sections.filter((s) => s.id !== sectionId),
      },
      saveStatus: "saving",
    }));
    get().triggerSave();
  },

  toggleSectionVisibility: (sectionId) => {
    set((state) => ({
      ...recordHistory(state),
      resumeData: {
        ...state.resumeData,
        sections: state.resumeData.sections.map((s) =>
          s.id === sectionId ? ({ ...s, visible: !s.visible } as Section) : s
        ),
      },
      saveStatus: "saving",
    }));
    get().triggerSave();
  },

  updateSectionTitle: (sectionId, title) => {
    set((state) => ({
      ...recordHistory(state),
      resumeData: {
        ...state.resumeData,
        sections: state.resumeData.sections.map((s) =>
          s.id === sectionId ? ({ ...s, title } as Section) : s
        ),
      },
      saveStatus: "saving",
    }));
    get().triggerSave();
  },

  toggleSectionLock: (sectionId) => {
    set((state) => ({
      ...recordHistory(state),
      resumeData: {
        ...state.resumeData,
        sections: state.resumeData.sections.map((s) =>
          s.id === sectionId ? ({ ...s, locked: !s.locked } as Section) : s
        ),
      },
      saveStatus: "saving",
    }));
    get().triggerSave();
  },

  duplicateSection: (sectionId) => {
    set((state) => {
      const targetSection = state.resumeData.sections.find((s) => s.id === sectionId);
      if (!targetSection) return state;

      const newSectionId = `${targetSection.type}-${Date.now()}`;
      const duplicatedItems = targetSection.items.map((item: any) => ({
        ...item,
        id: `${targetSection.type}-item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      }));

      const newSection: Section = {
        ...targetSection,
        id: newSectionId,
        title: `${targetSection.title} (Copy)`,
        order: targetSection.order + 1,
        items: duplicatedItems,
      };

      const targetIndex = state.resumeData.sections.findIndex((s) => s.id === sectionId);
      const newSections = [...state.resumeData.sections];
      newSections.splice(targetIndex + 1, 0, newSection);

      return {
        ...recordHistory(state),
        resumeData: {
          ...state.resumeData,
          sections: newSections.map((s, idx) => ({ ...s, order: idx } as Section)),
        },
        saveStatus: "saving",
      };
    });
    get().triggerSave();
  },

  moveSection: (sectionId, direction) => {
    set((state) => {
      const sections = [...state.resumeData.sections];
      const index = sections.findIndex((s) => s.id === sectionId);
      if (index === -1) return state;

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= sections.length) return state;

      const [moved] = sections.splice(index, 1);
      if (moved) {
        sections.splice(targetIndex, 0, moved);
      }

      return {
        ...recordHistory(state),
        resumeData: {
          ...state.resumeData,
          sections: sections.map((s, idx) => ({ ...s, order: idx } as Section)),
        },
        saveStatus: "saving",
      };
    });
    get().triggerSave();
  },

  reorderSections: (newSections) => {
    set((state) => ({
      ...recordHistory(state),
      resumeData: {
        ...state.resumeData,
        sections: newSections.map((s, idx) => ({ ...s, order: idx } as Section)),
      },
      saveStatus: "saving",
    }));
    get().triggerSave();
  },

  addSectionItem: (sectionId, itemTemplate) => {
    set((state) => {
      const targetSection = state.resumeData.sections.find((s) => s.id === sectionId);
      if (!targetSection) return state;

      const itemId = `${targetSection.type}-${Date.now()}`;
      let newItem: any;

      switch (targetSection.type) {
        case "experience":
          newItem = {
            id: itemId,
            type: "experience",
            company: "Company Name",
            position: "Job Title",
            location: "Location",
            startDate: "",
            endDate: "",
            current: false,
            description: "",
            highlights: [],
            ...itemTemplate,
          } satisfies ExperienceItem;
          break;
        case "education":
          newItem = {
            id: itemId,
            type: "education",
            institution: "University Name",
            degree: "Degree / Field",
            fieldOfStudy: "",
            location: "",
            startDate: "",
            endDate: "",
            current: false,
            gpa: "",
            honors: "",
            description: "",
            ...itemTemplate,
          } satisfies EducationItem;
          break;
        case "skills":
          newItem = {
            id: itemId,
            type: "skills",
            name: "Skill Name",
            level: "intermediate",
            rating: 3,
            category: "General",
            ...itemTemplate,
          } satisfies SkillItem;
          break;
        case "projects":
          newItem = {
            id: itemId,
            type: "projects",
            title: "Project Title",
            subtitle: "Brief tagline",
            link: "",
            startDate: "",
            endDate: "",
            description: "",
            technologies: [],
            ...itemTemplate,
          } satisfies ProjectItem;
          break;
        default:
          newItem = {
            id: itemId,
            type: targetSection.type,
            title: "New Entry",
            description: "",
            ...itemTemplate,
          };
      }

      const updatedSections = state.resumeData.sections.map((s) =>
        s.id === sectionId ? ({ ...s, items: [...s.items, newItem] } as Section) : s
      );

      return {
        ...recordHistory(state),
        resumeData: {
          ...state.resumeData,
          sections: updatedSections,
        },
        saveStatus: "saving",
      };
    });
    get().triggerSave();
  },

  updateSectionItem: (sectionId, itemId, data) => {
    set((state) => {
      const updatedSections = state.resumeData.sections.map((s) => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          items: s.items.map((item: any) =>
            item.id === itemId ? { ...item, ...data } : item
          ),
        } as Section;
      });

      return {
        ...recordHistory(state),
        resumeData: {
          ...state.resumeData,
          sections: updatedSections,
        },
        saveStatus: "saving",
      };
    });
    get().triggerSave();
  },

  removeSectionItem: (sectionId, itemId) => {
    set((state) => {
      const updatedSections = state.resumeData.sections.map((s) => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          items: s.items.filter((item: any) => item.id !== itemId),
        } as Section;
      });

      return {
        ...recordHistory(state),
        resumeData: {
          ...state.resumeData,
          sections: updatedSections,
        },
        saveStatus: "saving",
      };
    });
    get().triggerSave();
  },

  duplicateSectionItem: (sectionId, itemId) => {
    set((state) => {
      const updatedSections = state.resumeData.sections.map((s) => {
        if (s.id !== sectionId) return s;
        const items = [...s.items] as any[];
        const itemIndex = items.findIndex((item: any) => item.id === itemId);
        if (itemIndex === -1) return s;
        const original = items[itemIndex];
        if (!original) return s;
        const cloned: any = {
          ...original,
          id: `${s.type}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          ...(original.company ? { company: `${original.company} (Copy)` } : {}),
          ...(original.title ? { title: `${original.title} (Copy)` } : {}),
          ...(original.institution ? { institution: `${original.institution} (Copy)` } : {}),
          ...(original.name ? { name: `${original.name} (Copy)` } : {}),
        };
        items.splice(itemIndex + 1, 0, cloned);
        return { ...s, items } as Section;
      });

      return {
        ...recordHistory(state),
        resumeData: {
          ...state.resumeData,
          sections: updatedSections,
        },
        saveStatus: "saving",
      };
    });
    get().triggerSave();
  },

  moveSectionItem: (sectionId, itemId, direction) => {
    set((state) => {
      const updatedSections = state.resumeData.sections.map((s) => {
        if (s.id !== sectionId) return s;
        const items = [...s.items] as any[];
        const index = items.findIndex((item: any) => item.id === itemId);
        if (index === -1) return s;

        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= items.length) return s;

        const [moved] = items.splice(index, 1);
        if (moved) {
          items.splice(targetIndex, 0, moved);
        }

        return { ...s, items } as Section;
      });

      return {
        ...recordHistory(state),
        resumeData: {
          ...state.resumeData,
          sections: updatedSections,
        },
        saveStatus: "saving",
      };
    });
    get().triggerSave();
  },

  reorderSectionItems: (sectionId, startIndex, endIndex) => {
    set((state) => {
      const updatedSections = state.resumeData.sections.map((s) => {
        if (s.id !== sectionId) return s;
        const items = [...s.items] as any[];
        const [moved] = items.splice(startIndex, 1);
        if (moved) {
          items.splice(endIndex, 0, moved);
        }
        return { ...s, items } as Section;
      });

      return {
        ...recordHistory(state),
        resumeData: {
          ...state.resumeData,
          sections: updatedSections,
        },
        saveStatus: "saving",
      };
    });
    get().triggerSave();
  },

  setResumeData: (data) => {
    set((state) => ({
      ...recordHistory(state),
      resumeData: data,
      saveStatus: "saving",
    }));
    get().triggerSave();
  },

  importResume: (data) => {
    set((state) => ({
      ...recordHistory(state),
      resumeData: data,
      activeSectionId: null,
      saveStatus: "saving",
    }));
    get().triggerSave();
  },

  resetToDefault: () => {
    set((state) => ({
      ...recordHistory(state),
      resumeData: initialResumeData,
      saveStatus: "saving",
    }));
    get().triggerSave();
  },

  triggerSave: () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      if (typeof window !== "undefined") {
        const state = get();
        const current = state.resumeData;
        const targetId = state.activeResumeId;
        const targetKey = targetId ? getResumeStorageKey(targetId) : STORAGE_KEY;

        const result = safeLocalStorageSet(targetKey, JSON.stringify(current));

        if (targetId) {
          useResumeIndexStore.getState().updateIndexItem(targetId, {
            title: current.title,
            templateId: current.theme?.templateId || "modern",
            completenessScore: calculateCompleteness(current),
            updatedAt: new Date().toISOString(),
          });
        }

        set({
          saveStatus: "saved",
          lastSavedAt: new Date().toLocaleTimeString(),
          isStorageQuotaExceeded: result.quotaExceeded,
        });
      }
    }, 600); // 600ms debounce
  },
}));
