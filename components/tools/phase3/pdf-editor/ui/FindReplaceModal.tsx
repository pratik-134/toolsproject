import React, { useState } from "react";
import {
  X,
  Replace,
  Search,
  Check,
  Loader2,
  FileText,
  Sparkles,
} from "lucide-react";
import { searchPdfText, SearchMatch } from "../logic";
import { generateFindAndReplaceElements } from "../comparison";
import { usePdfEditorStore } from "../store";

interface FindReplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawPdfDoc: any;
}

export const FindReplaceModal: React.FC<FindReplaceModalProps> = ({
  isOpen,
  onClose,
  rawPdfDoc,
}) => {
  const { addElement } = usePdfEditorStore();

  const [findQuery, setFindQuery] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [matches, setMatches] = useState<SearchMatch[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!findQuery.trim() || !rawPdfDoc) return;
    setIsSearching(true);
    setHasSearched(true);
    try {
      const results = await searchPdfText(rawPdfDoc, findQuery.trim());
      setMatches(results);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleApplyReplace = () => {
    if (matches.length === 0) return;

    const { whiteouts, replacementTexts } = generateFindAndReplaceElements(
      matches,
      replaceText
    );

    // Apply whiteouts first to cover original characters
    whiteouts.forEach((w) => addElement(w));
    // Apply replacement text elements over the whiteouts
    replacementTexts.forEach((t) => addElement(t));

    alert(`Successfully replaced ${matches.length} occurrence(s) across document.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-card text-foreground border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Replace className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-base font-bold text-foreground">Find & Replace Text</h2>
              <p className="text-xs text-muted-foreground">Add or replace text via high-precision vector overlay</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Find String in Document
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={findQuery}
                  onChange={(e) => setFindQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="e.g. Acme Corp or outdated clause..."
                  className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                />
                <button
                  onClick={handleSearch}
                  disabled={!findQuery.trim() || isSearching}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  <span>Find</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Replacement Text ("Add or replace text")
              </label>
              <input
                type="text"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="e.g. Cleartrix Global Ltd..."
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Results Summary */}
          {hasSearched && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Matches Found</span>
                <span className="font-mono text-primary font-bold">{matches.length} instance(s)</span>
              </div>

              {matches.length === 0 ? (
                <div className="p-4 rounded-xl border border-border/60 bg-muted/20 text-center text-xs text-muted-foreground">
                  No exact matches found for "{findQuery}".
                </div>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 rounded-xl border border-border/60 bg-muted/10">
                  {matches.slice(0, 10).map((m, idx) => (
                    <div
                      key={idx}
                      className="text-[11px] p-2 rounded-lg bg-card border border-border/40 flex items-center justify-between"
                    >
                      <span className="truncate max-w-[280px] font-mono text-muted-foreground">
                        "{m.text}"
                      </span>
                      <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-semibold text-foreground">
                        Page {m.pageIndex + 1}
                      </span>
                    </div>
                  ))}
                  {matches.length > 10 && (
                    <div className="text-[10px] text-center text-muted-foreground pt-1">
                      + {matches.length - 10} more occurrences
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground max-w-[260px]">
              Applies exact-match background whiteouts and overlays new typography client-side.
            </p>
            <button
              onClick={handleApplyReplace}
              disabled={matches.length === 0}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-xs hover:bg-primary/90 transition-all disabled:opacity-40"
            >
              Replace All ({matches.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
