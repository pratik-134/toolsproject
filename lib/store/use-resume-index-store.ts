import { create } from "zustand";
import { ResumeData, initialResumeData, resumeDataSchema } from "../schema";
import { ResumeIndexItem, resumeIndexSchema } from "./resume-index-schema";
import { migrateLegacyDraft } from "./migrate-legacy-draft";
import {
  INDEX_STORAGE_KEY,
  getResumeStorageKey,
  safeLocalStorageGet,
  safeLocalStorageSet,
  safeLocalStorageRemove,
  getStorageUsage,
  StorageUsage,
  runBrandStorageMigration,
} from "./storage-utils";

export interface ResumeIndexState {
  resumes: ResumeIndexItem[];
  activeResumeId: string | null;
  isStorageQuotaExceeded: boolean;
  storageUsage: StorageUsage;
  isInitialized: boolean;

  // Actions
  loadIndex: () => ResumeIndexItem[];
  createResume: (options?: {
    templateId?: string;
    title?: string;
    initialData?: ResumeData;
  }) => string;
  renameResume: (id: string, newTitle: string) => void;
  duplicateResume: (id: string) => string | null;
  deleteResume: (id: string) => void;
  updateIndexItem: (id: string, partial: Partial<ResumeIndexItem>) => void;
  setActiveResumeId: (id: string | null) => void;
  getResumeDataById: (id: string) => ResumeData | null;
  refreshStorageUsage: () => void;
  exportAllResumesJson: () => string;
  importResumesBackupJson: (jsonString: string) => { importedCount: number; errors: string[] };
}

function generateResumeId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export const useResumeIndexStore = create<ResumeIndexState>((set, get) => ({
  resumes: [],
  activeResumeId: null,
  isStorageQuotaExceeded: false,
  storageUsage: {
    usedBytes: 0,
    quotaBytes: 5 * 1024 * 1024,
    percentage: 0,
    formattedUsed: "0 KB",
  },
  isInitialized: false,

  loadIndex: () => {
    runBrandStorageMigration();
    const list = migrateLegacyDraft();
    const usage = getStorageUsage();
    set({
      resumes: list,
      storageUsage: usage,
      isInitialized: true,
    });
    return list;
  },

  createResume: (options) => {
    let currentResumes = get().resumes;
    if (!get().isInitialized) {
      currentResumes = get().loadIndex();
    }

    const newId = generateResumeId();
    const title = options?.title?.trim() || "Untitled Resume";
    const templateId = options?.templateId || "modern";

    let resumeData: ResumeData;
    if (options?.initialData) {
      resumeData = {
        ...options.initialData,
        id: newId,
        title,
        theme: {
          ...options.initialData.theme,
          templateId,
        },
        meta: {
          ...options.initialData.meta,
          lastEditedAt: new Date().toISOString(),
        },
      };
    } else {
      resumeData = {
        ...initialResumeData,
        id: newId,
        title,
        theme: {
          ...initialResumeData.theme,
          templateId,
        },
        meta: {
          ...initialResumeData.meta,
          lastEditedAt: new Date().toISOString(),
        },
      };
    }

    // Save full resume payload
    const resumeKey = getResumeStorageKey(newId);
    const saveResult = safeLocalStorageSet(resumeKey, JSON.stringify(resumeData));

    const newItem: ResumeIndexItem = {
      id: newId,
      title,
      templateId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completenessScore: resumeData.meta?.completenessScore || 0,
    };

    const updatedList = [newItem, ...currentResumes];
    safeLocalStorageSet(INDEX_STORAGE_KEY, JSON.stringify(updatedList));

    set({
      resumes: updatedList,
      activeResumeId: newId,
      isStorageQuotaExceeded: saveResult.quotaExceeded,
      storageUsage: getStorageUsage(),
    });

    return newId;
  },

  renameResume: (id, newTitle) => {
    const trimmed = newTitle.trim() || "Untitled Resume";
    const updatedList = get().resumes.map((item) =>
      item.id === id ? { ...item, title: trimmed, updatedAt: new Date().toISOString() } : item
    );

    safeLocalStorageSet(INDEX_STORAGE_KEY, JSON.stringify(updatedList));

    // Also update title in full resume record
    const resumeKey = getResumeStorageKey(id);
    const raw = safeLocalStorageGet(resumeKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        parsed.title = trimmed;
        parsed.meta = { ...parsed.meta, lastEditedAt: new Date().toISOString() };
        safeLocalStorageSet(resumeKey, JSON.stringify(parsed));
      } catch {
        // Ignore parse error
      }
    }

    set({
      resumes: updatedList,
      storageUsage: getStorageUsage(),
    });
  },

  duplicateResume: (id) => {
    let currentResumes = get().resumes;
    if (!get().isInitialized) {
      currentResumes = get().loadIndex();
    }

    const original = get().getResumeDataById(id);
    if (!original) return null;

    const newId = generateResumeId();
    const newTitle = `${original.title || "Untitled Resume"} (Copy)`;

    const duplicatedData: ResumeData = {
      ...original,
      id: newId,
      title: newTitle,
      meta: {
        ...original.meta,
        lastEditedAt: new Date().toISOString(),
      },
    };

    const resumeKey = getResumeStorageKey(newId);
    const saveResult = safeLocalStorageSet(resumeKey, JSON.stringify(duplicatedData));

    const newItem: ResumeIndexItem = {
      id: newId,
      title: newTitle,
      templateId: duplicatedData.theme?.templateId || "modern",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completenessScore: duplicatedData.meta?.completenessScore || 0,
    };

    const updatedList = [newItem, ...currentResumes];
    safeLocalStorageSet(INDEX_STORAGE_KEY, JSON.stringify(updatedList));

    set({
      resumes: updatedList,
      isStorageQuotaExceeded: saveResult.quotaExceeded,
      storageUsage: getStorageUsage(),
    });

    return newId;
  },

  deleteResume: (id) => {
    const resumeKey = getResumeStorageKey(id);
    safeLocalStorageRemove(resumeKey);

    const updatedList = get().resumes.filter((item) => item.id !== id);
    safeLocalStorageSet(INDEX_STORAGE_KEY, JSON.stringify(updatedList));

    const newActiveId = get().activeResumeId === id ? null : get().activeResumeId;

    set({
      resumes: updatedList,
      activeResumeId: newActiveId,
      storageUsage: getStorageUsage(),
    });
  },

  updateIndexItem: (id, partial) => {
    const updatedList = get().resumes.map((item) => {
      if (item.id !== id) return item;
      return {
        ...item,
        ...partial,
        updatedAt: new Date().toISOString(),
      };
    });

    safeLocalStorageSet(INDEX_STORAGE_KEY, JSON.stringify(updatedList));
    set({
      resumes: updatedList,
      storageUsage: getStorageUsage(),
    });
  },

  setActiveResumeId: (id) => {
    set({ activeResumeId: id });
  },

  getResumeDataById: (id) => {
    const resumeKey = getResumeStorageKey(id);
    const raw = safeLocalStorageGet(resumeKey);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      const validation = resumeDataSchema.safeParse(parsed);
      if (validation.success) {
        return validation.data;
      }
      return parsed as ResumeData;
    } catch {
      return null;
    }
  },

  refreshStorageUsage: () => {
    set({ storageUsage: getStorageUsage() });
  },

  exportAllResumesJson: () => {
    const resumes = get().resumes;
    const backupList: { index: ResumeIndexItem; data: ResumeData }[] = [];

    for (const item of resumes) {
      const data = get().getResumeDataById(item.id);
      if (data) {
        backupList.push({ index: item, data });
      }
    }

    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      source: "qwertygen",
      resumesCount: backupList.length,
      resumes: backupList,
    };

    return JSON.stringify(payload, null, 2);
  },

  importResumesBackupJson: (jsonString: string) => {
    const errors: string[] = [];
    let importedCount = 0;

    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || !Array.isArray(parsed.resumes)) {
        return { importedCount: 0, errors: ["Invalid backup file format: missing resumes list."] };
      }

      const existingResumes = [...get().resumes];

      for (let i = 0; i < parsed.resumes.length; i++) {
        const entry = parsed.resumes[i];
        if (!entry || !entry.index || !entry.data) {
          errors.push(`Entry #${i + 1} is missing index or resume data.`);
          continue;
        }

        const item: ResumeIndexItem = entry.index;
        const data: ResumeData = entry.data;

        // Save data to localStorage
        const resumeKey = getResumeStorageKey(item.id);
        const dataSaveSuccess = safeLocalStorageSet(resumeKey, JSON.stringify(data));
        if (!dataSaveSuccess) {
          errors.push(`Could not save resume "${item.title}": storage quota exceeded.`);
          break;
        }

        // Add or update index
        const existingIdx = existingResumes.findIndex((r) => r.id === item.id);
        if (existingIdx >= 0) {
          existingResumes[existingIdx] = item;
        } else {
          existingResumes.push(item);
        }

        importedCount++;
      }

      // Save updated index
      safeLocalStorageSet(INDEX_STORAGE_KEY, JSON.stringify(existingResumes));

      set({
        resumes: existingResumes,
        storageUsage: getStorageUsage(),
      });

      return { importedCount, errors };
    } catch (err: unknown) {
      return {
        importedCount: 0,
        errors: [err instanceof Error ? err.message : "Failed to parse JSON backup file."],
      };
    }
  },
}));
