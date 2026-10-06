"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  Languages,
  ArrowLeftRight,
  Copy,
  Check,
  Download,
  Volume2,
  Mic,
  MicOff,
  X,
  RotateCcw,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  Layers,
  Search,
} from "lucide-react";
import {
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
  translateText,
  detectLanguage,
  getLanguageMetadata,
} from "./logic";
import { translateAction } from "@/app/actions/translate";
import { setPipelineHandoff } from "@/lib/pipeline/handoff";

const PINNED_SOURCE_CODES = ["auto", "en", "es", "fr", "de"];
const PINNED_TARGET_CODES = ["es", "en", "fr", "de", "hi"];

const BCP47_LOCALE_MAP: Record<string, string> = {
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  it: "it-IT",
  pt: "pt-BR",
  ru: "ru-RU",
  zh: "zh-CN",
  ja: "ja-JP",
  ko: "ko-KR",
  hi: "hi-IN",
  ar: "ar-SA",
  bn: "bn-IN",
  tr: "tr-TR",
  vi: "vi-VN",
  pl: "pl-PL",
  uk: "uk-UA",
  nl: "nl-NL",
  el: "el-GR",
  sv: "sv-SE",
  cs: "cs-CZ",
  he: "he-IL",
  id: "id-ID",
  th: "th-TH",
  ro: "ro-RO",
  hu: "hu-HU",
  da: "da-DK",
  fi: "fi-FI",
  no: "no-NO",
  fa: "fa-IR",
  ur: "ur-PK",
  ta: "ta-IN",
  mr: "mr-IN",
  gu: "gu-IN",
};

interface SavedTranslation {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  timestamp: number;
}

export default function LanguageTranslatorTool() {
  const [sourceText, setSourceText] = useState<string>("Hello, how are you today?");
  const [sourceLang, setSourceLang] = useState<string>("auto");
  const [targetLang, setTargetLang] = useState<string>("es");
  const [translatedText, setTranslatedText] = useState<string>("");
  const [detectedLangCode, setDetectedLangCode] = useState<string>("en");
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [savedItems, setSavedItems] = useState<SavedTranslation[]>([]);
  const [showSavedList, setShowSavedList] = useState<boolean>(false);
  const [sourceSearchOpen, setSourceSearchOpen] = useState<boolean>(false);
  const [targetSearchOpen, setTargetSearchOpen] = useState<boolean>(false);
  const [langSearchQuery, setLangSearchQuery] = useState<string>("");
  const [handoffSuccess, setHandoffSuccess] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Active language metadata
  const currentSourceMeta = useMemo(() => {
    if (sourceLang === "auto") {
      const detected = getLanguageMetadata(detectedLangCode);
      return {
        code: "auto",
        name: detected ? `Detect language (${detected.name})` : "Detect language",
        nativeName: "Auto",
        dir: "ltr" as const,
      };
    }
    return getLanguageMetadata(sourceLang) || SUPPORTED_LANGUAGES[0]!;
  }, [sourceLang, detectedLangCode]);

  const currentTargetMeta = useMemo(() => {
    return getLanguageMetadata(targetLang) || SUPPORTED_LANGUAGES[1]!;
  }, [targetLang]);

  // Execute translation via Google Translate Neural Action with local fallback
  const performTranslation = useCallback(
    async (text: string, from: string, to: string) => {
      if (!text || !text.trim()) {
        setTranslatedText("");
        setIsTranslating(false);
        return;
      }

      setIsTranslating(true);
      try {
        const response = await translateAction(text, from, to);
        if (response.success && response.translatedText) {
          setTranslatedText(response.translatedText);
          if (response.detectedLang) {
            setDetectedLangCode(response.detectedLang);
          }
        } else {
          // Graceful fallback to local in-browser lexicon engine
          const localResult = translateText(text, from, to);
          setTranslatedText(localResult.translatedText);
          if (localResult.detectedLang) {
            setDetectedLangCode(localResult.detectedLang);
          }
        }
      } catch {
        // Local fallback
        const localResult = translateText(text, from, to);
        setTranslatedText(localResult.translatedText);
        if (localResult.detectedLang) {
          setDetectedLangCode(localResult.detectedLang);
        }
      } finally {
        setIsTranslating(false);
      }
    },
    []
  );

  // Debounced translation trigger
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!sourceText.trim()) {
      setTranslatedText("");
      setIsTranslating(false);
      return;
    }

    // Immediate local heuristic detection
    if (sourceLang === "auto") {
      const localDetected = detectLanguage(sourceText);
      setDetectedLangCode(localDetected.code);
    }

    debounceTimerRef.current = setTimeout(() => {
      performTranslation(sourceText, sourceLang, targetLang);
    }, 350);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [sourceText, sourceLang, targetLang, performTranslation]);

  // Swap languages
  const handleSwap = () => {
    const nextTarget = sourceLang === "auto" ? detectedLangCode : sourceLang;
    const nextSource = targetLang;
    const nextText = translatedText || sourceText;

    setSourceLang(nextSource);
    setTargetLang(nextTarget);
    setSourceText(nextText);
  };

  // Copy to clipboard
  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download translated text
  const handleDownload = () => {
    if (!translatedText) return;
    const blob = new Blob([translatedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `translation-${targetLang}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Speech-to-Text Microphone Recording
  const toggleSpeechRecognition = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = sourceLang === "auto" ? "en-US" : sourceLang;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setSourceText(transcript);
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Stop any active speech/audio
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  // Google Translate authentic audio stream fallback
  const playGoogleTtsAudio = useCallback((text: string, lang: string) => {
    try {
      const cleanLang = lang.toLowerCase().split("-")[0] ?? "en";
      const encoded = encodeURIComponent(text.slice(0, 200));
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${cleanLang}&client=tw-ob`;

      const audio = new Audio(ttsUrl);
      audioRef.current = audio;

      setIsSpeaking(true);
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => setIsSpeaking(false);

      audio.play().catch(() => {
        setIsSpeaking(false);
      });
    } catch {
      setIsSpeaking(false);
    }
  }, []);

  // Text-to-Speech Pronunciation Audio Playback
  const handleSpeak = useCallback(
    (text: string, langCode: string) => {
      if (!text || !text.trim()) return;

      // If already speaking, toggle off
      if (isSpeaking) {
        stopAudio();
        return;
      }

      const trimmed = text.trim();
      const cleanCode = langCode.toLowerCase().split("-")[0] ?? "en";
      const fullLocale = BCP47_LOCALE_MAP[cleanCode] || `${cleanCode}-${cleanCode.toUpperCase()}`;

      stopAudio();

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
          window.speechSynthesis.resume();

          const voices = window.speechSynthesis.getVoices();
          const matchedVoice = voices.find(
            (v) =>
              v.lang.toLowerCase() === fullLocale.toLowerCase() ||
              v.lang.toLowerCase().startsWith(cleanCode)
          );

          if (matchedVoice) {
            const utterance = new SpeechSynthesisUtterance(trimmed);
            utteranceRef.current = utterance;
            utterance.voice = matchedVoice;
            utterance.lang = matchedVoice.lang;
            utterance.rate = 0.95;

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => {
              setIsSpeaking(false);
              utteranceRef.current = null;
            };
            utterance.onerror = () => {
              setIsSpeaking(false);
              utteranceRef.current = null;
              playGoogleTtsAudio(trimmed, cleanCode);
            };

            window.speechSynthesis.speak(utterance);
            return;
          }
        } catch {
          // Fall through to Google TTS audio
        }
      }

      playGoogleTtsAudio(trimmed, cleanCode);
    },
    [isSpeaking, stopAudio, playGoogleTtsAudio]
  );

  // Toggle Save to Favorites
  const isCurrentSaved = useMemo(() => {
    return savedItems.some(
      (item) => item.sourceText === sourceText && item.targetLang === targetLang
    );
  }, [savedItems, sourceText, targetLang]);

  const toggleSave = () => {
    if (!sourceText.trim() || !translatedText.trim()) return;

    if (isCurrentSaved) {
      setSavedItems((prev) =>
        prev.filter((i) => !(i.sourceText === sourceText && i.targetLang === targetLang))
      );
    } else {
      const newItem: SavedTranslation = {
        id: `trans_${Date.now()}`,
        sourceText,
        translatedText,
        sourceLang,
        targetLang,
        timestamp: Date.now(),
      };
      setSavedItems((prev) => [newItem, ...prev.slice(0, 24)]);
    }
  };

  // Cross-tool Pipeline Handoff
  const handleHandoff = (targetToolSlug: string) => {
    if (!translatedText) return;
    try {
      setPipelineHandoff({
        sourceSlug: "language-translator",
        sourceToolName: "Language Translator",
        targetSlug: targetToolSlug,
        dataType: "text",
        textData: translatedText,
        title: `Translation (${currentTargetMeta.name})`,
      });
      setHandoffSuccess(true);
      setTimeout(() => setHandoffSuccess(false), 3000);
    } catch {
      // Graceful error handling
    }
  };

  // Filtered languages for dropdown modal
  const filteredLanguages = useMemo(() => {
    if (!langSearchQuery.trim()) return SUPPORTED_LANGUAGES;
    const q = langSearchQuery.toLowerCase();
    return SUPPORTED_LANGUAGES.filter(
      (l) => l.name.toLowerCase().includes(q) || l.nativeName.toLowerCase().includes(q)
    );
  }, [langSearchQuery]);

  return (
    <div className="space-y-4 max-w-6xl mx-auto font-sans">
      {/* Top Header / Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
            <Languages className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-foreground">
              ClearTrix Translate
            </h1>
            <p className="text-xs text-muted-foreground">
              Real-time Google Translate neural engine with on-device speech & pronunciation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {savedItems.length > 0 && (
            <button
              type="button"
              onClick={() => setShowSavedList(!showSavedList)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium text-foreground transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-500" />
              <span>Saved ({savedItems.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setSourceText("");
              setTranslatedText("");
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted text-xs text-muted-foreground transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Google Translate Card */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Language Tabs Selector Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border border-b border-border bg-muted/20">
          {/* Source Language Bar */}
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              {PINNED_SOURCE_CODES.map((code) => {
                const isSelected = sourceLang === code;
                const label =
                  code === "auto"
                    ? detectedLangCode
                      ? `Detect (${getLanguageMetadata(detectedLangCode)?.name || "Language"})`
                      : "Detect language"
                    : getLanguageMetadata(code)?.name || code;

                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setSourceLang(code)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  setSourceSearchOpen(true);
                  setLangSearchQuery("");
                }}
                className="px-2 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1"
              >
                <span>More</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Target Language Bar & Swap Button */}
          <div className="flex items-center justify-between p-2">
            <button
              type="button"
              onClick={handleSwap}
              title="Swap languages"
              aria-label="Swap languages"
              className="p-2 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-transform hover:scale-105 shrink-0 mr-2"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1 overflow-x-auto py-1 flex-1">
              {PINNED_TARGET_CODES.map((code) => {
                const isSelected = targetLang === code;
                const label = getLanguageMetadata(code)?.name || code;

                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setTargetLang(code)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  setTargetSearchOpen(true);
                  setLangSearchQuery("");
                }}
                className="px-2 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1"
              >
                <span>More</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Dual Editor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
          {/* Source Text Area Card */}
          <div className="p-4 flex flex-col justify-between min-h-[260px] relative bg-background">
            <div className="relative">
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Type to translate, dictation, or paste text..."
                rows={8}
                maxLength={5000}
                className="w-full text-base sm:text-lg bg-transparent text-foreground placeholder:text-muted-foreground/50 focus:outline-none resize-none leading-relaxed font-sans"
              />

              {sourceText.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSourceText("")}
                  title="Clear text"
                  className="absolute top-0 right-0 p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Source Bottom Action Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-border/40 mt-3 text-muted-foreground">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  title={isListening ? "Stop listening" : "Translate by voice"}
                  className={`p-2 rounded-full transition-colors ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse"
                      : "hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleSpeak(
                      sourceText,
                      sourceLang === "auto" ? detectedLangCode : sourceLang
                    )
                  }
                  disabled={!sourceText.trim()}
                  title={isSpeaking ? "Stop sound" : "Listen to pronunciation"}
                  className={`p-2 rounded-full hover:bg-muted transition-colors disabled:opacity-30 ${
                    isSpeaking ? "text-blue-600 bg-blue-50 dark:bg-blue-950/40 animate-pulse" : "hover:text-foreground"
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs font-mono text-muted-foreground">
                {sourceText.length} / 5,000
              </div>
            </div>
          </div>

          {/* Target Text Area Card */}
          <div className="p-4 flex flex-col justify-between min-h-[260px] bg-muted/10 relative">
            <div>
              {isTranslating && (
                <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium pb-2 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Translating in real time...</span>
                </div>
              )}

              <div
                dir={currentTargetMeta.dir}
                className={`text-base sm:text-lg font-sans leading-relaxed whitespace-pre-wrap select-text min-h-[160px] ${
                  translatedText
                    ? "text-foreground font-medium"
                    : "text-muted-foreground/40 italic"
                }`}
              >
                {translatedText || "Translation"}
              </div>
            </div>

            {/* Target Bottom Action Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-border/40 mt-3 text-muted-foreground">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleSpeak(translatedText, targetLang)}
                  disabled={!translatedText}
                  title={isSpeaking ? "Stop sound" : "Listen to translation pronunciation"}
                  className={`p-2 rounded-full hover:bg-muted transition-colors disabled:opacity-30 ${
                    isSpeaking ? "text-blue-600 bg-blue-50 dark:bg-blue-950/40 animate-pulse" : "hover:text-foreground"
                  }`}
                >
                  <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!translatedText}
                  title="Copy translation"
                  className="p-2 rounded-full hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={toggleSave}
                  disabled={!translatedText}
                  title={isCurrentSaved ? "Remove from saved" : "Save translation"}
                  className="p-2 rounded-full hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30"
                >
                  {isCurrentSaved ? (
                    <BookmarkCheck className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!translatedText}
                  title="Download translation text file"
                  className="p-2 rounded-full hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-muted-foreground font-medium">
                {currentTargetMeta.name}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Translations Drawer */}
      {showSavedList && (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-foreground">
                Saved Translations ({savedItems.length})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSavedItems([])}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Clear Saved
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
            {savedItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-border bg-background hover:border-blue-500/50 transition-colors flex flex-col justify-between cursor-pointer"
                onClick={() => {
                  setSourceText(item.sourceText);
                  setTranslatedText(item.translatedText);
                  setTargetLang(item.targetLang);
                }}
              >
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground line-clamp-1">{item.sourceText}</p>
                  <p className="text-sm font-medium text-foreground line-clamp-1">
                    {item.translatedText}
                  </p>
                </div>
                <div className="text-[10px] text-muted-foreground pt-1 flex justify-between">
                  <span>{getLanguageMetadata(item.targetLang)?.name || item.targetLang}</span>
                  <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connected Cross-Tool Pipeline Workflows */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">
              Connected Tool Workflows
            </span>
          </div>
          {handoffSuccess && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Handoff payload ready!</span>
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Send translation directly to downstream tools in private browser memory:
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleHandoff("word-counter")}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors"
          >
            Send to Word Counter
          </button>
          <button
            type="button"
            onClick={() => handleHandoff("client-pastebin")}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors"
          >
            Send to Client Pastebin
          </button>
          <button
            type="button"
            onClick={() => handleHandoff("burn-after-read-secret")}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors"
          >
            Send to Burn Secret Sharer
          </button>
        </div>
      </div>

      {/* Language Selection Modal (Source) */}
      {sourceSearchOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-2xl border border-border bg-card p-5 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Select Source Language</h3>
              <button
                type="button"
                onClick={() => setSourceSearchOpen(false)}
                className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <input
                type="text"
                value={langSearchQuery}
                onChange={(e) => setLangSearchQuery(e.target.value)}
                placeholder="Search languages..."
                className="w-full text-xs rounded-xl border border-border bg-background pl-9 pr-3 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto pt-1">
              <button
                type="button"
                onClick={() => {
                  setSourceLang("auto");
                  setSourceSearchOpen(false);
                }}
                className={`text-left p-2.5 rounded-lg text-xs transition-colors ${
                  sourceLang === "auto"
                    ? "bg-blue-600 text-white font-semibold"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                <div className="font-medium">Auto Detect</div>
                <div className="text-[10px] opacity-70">Any Language</div>
              </button>

              {filteredLanguages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setSourceLang(lang.code);
                    setSourceSearchOpen(false);
                  }}
                  className={`text-left p-2.5 rounded-lg text-xs transition-colors ${
                    sourceLang === lang.code
                      ? "bg-blue-600 text-white font-semibold"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  <div className="font-medium">{lang.name}</div>
                  <div className="text-[10px] opacity-70">{lang.nativeName}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Language Selection Modal (Target) */}
      {targetSearchOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-2xl border border-border bg-card p-5 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Select Target Language</h3>
              <button
                type="button"
                onClick={() => setTargetSearchOpen(false)}
                className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <input
                type="text"
                value={langSearchQuery}
                onChange={(e) => setLangSearchQuery(e.target.value)}
                placeholder="Search languages..."
                className="w-full text-xs rounded-xl border border-border bg-background pl-9 pr-3 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto pt-1">
              {filteredLanguages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setTargetLang(lang.code);
                    setTargetSearchOpen(false);
                  }}
                  className={`text-left p-2.5 rounded-lg text-xs transition-colors ${
                    targetLang === lang.code
                      ? "bg-blue-600 text-white font-semibold"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  <div className="font-medium">{lang.name}</div>
                  <div className="text-[10px] opacity-70">{lang.nativeName}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
