import React, { useState } from "react";
import { X, Search, ShieldAlert, Check, Loader2 } from "lucide-react";
import { searchPdfText, SearchMatch } from "../logic";
import { RedactionItem } from "../types";

interface SearchRedactModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawPdfDoc: any;
  onApplyRedactionMatches: (matches: RedactionItem[]) => void;
}

export const SearchRedactModal: React.FC<SearchRedactModalProps> = ({
  isOpen,
  onClose,
  rawPdfDoc,
  onApplyRedactionMatches,
}) => {
  const [query, setQuery] = useState("");
  const [label, setLabel] = useState("[REDACTED]");
  const [isSearching, setIsSearching] = useState(false);
  const [matches, setMatches] = useState<SearchMatch[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!query.trim() || !rawPdfDoc) return;
    setIsSearching(true);
    setHasSearched(true);
    try {
      const results = await searchPdfText(rawPdfDoc, query.trim());
      setMatches(results);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRedactAll = () => {
    const redactionItems: RedactionItem[] = matches.map((m, idx) => ({
      id: `redact-match-${Date.now()}-${idx}`,
      pageIndex: m.pageIndex,
      x: m.x - 2,
      y: m.y - 1,
      width: m.width + 4,
      height: m.height + 2,
      label: label.trim() || "[REDACTED]",
    }));

    onApplyRedactionMatches(redactionItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-card text-foreground border border-border w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-semibold">Search & Batch Redact</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="text-muted-foreground block mb-1 font-medium">
              Search term or sensitive pattern to redact:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="e.g. Social Security, confidential, contract amount"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                  autoFocus
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-border bg-background focus:outline-hidden focus:border-primary text-xs"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={isSearching || !query.trim()}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-1.5"
              >
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Search"}
              </button>
            </div>
          </div>

          <div>
            <label className="text-muted-foreground block mb-1 font-medium">
              Redaction Exemption Label (printed over black boxes):
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. [REDACTED], FOIA (b)(4), PRIVILEGED"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-hidden font-mono text-xs"
            />
          </div>

          {/* Results list */}
          <div className="border border-border rounded-lg p-3 bg-muted/20 min-h-[140px] max-h-[220px] overflow-y-auto space-y-2">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Searching all pages in local memory...</span>
              </div>
            ) : hasSearched && matches.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No matching text found across any page.
              </div>
            ) : !hasSearched ? (
              <div className="text-center py-8 text-muted-foreground">
                Enter a search term above to find occurrences across all document pages.
              </div>
            ) : (
              <div>
                <span className="font-semibold text-foreground block mb-2">
                  Found {matches.length} {matches.length === 1 ? "occurrence" : "occurrences"}:
                </span>
                <div className="space-y-1.5">
                  {matches.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-background border border-border flex items-center justify-between"
                    >
                      <div className="truncate max-w-[340px]">
                        <span className="font-mono text-primary font-medium mr-2">
                          Page {m.pageIndex + 1}
                        </span>
                        <span className="text-foreground">{m.text}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {Math.round(m.width)}×{Math.round(m.height)} pt
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border bg-muted/30 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            {matches.length > 0 && `${matches.length} areas will be marked for permanent redaction`}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRedactAll}
              disabled={matches.length === 0}
              className="px-4 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Redact All Matches</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
