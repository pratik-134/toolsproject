import React, { useState } from "react";
import { X, Lock, Unlock, ShieldCheck, Check } from "lucide-react";
import { usePdfEditorStore } from "../store";

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({ isOpen, onClose }) => {
  const { security, setSecurity } = usePdfEditorStore();

  const [password, setPassword] = useState(security.userPassword || "");
  const [confirmPassword, setConfirmPassword] = useState(security.userPassword || "");
  const [allowPrinting, setAllowPrinting] = useState(security.permissions.allowPrinting);
  const [allowCopying, setAllowCopying] = useState(security.permissions.allowCopying);
  const [allowModifying, setAllowModifying] = useState(security.permissions.allowModifying);
  const [allowAnnotating, setAllowAnnotating] = useState(security.permissions.allowAnnotating);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    if (password && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSecurity({
      isEncrypted: Boolean(password.trim()),
      userPassword: password.trim(),
      permissions: {
        allowPrinting,
        allowCopying,
        allowModifying,
        allowAnnotating,
      },
    });

    onClose();
  };

  const handleRemoveProtection = () => {
    setPassword("");
    setConfirmPassword("");
    setSecurity({
      isEncrypted: false,
      userPassword: "",
      permissions: {
        allowPrinting: true,
        allowCopying: true,
        allowModifying: true,
        allowAnnotating: true,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-card text-foreground border border-border w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">Document Security & Passwords</h2>
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
          <div className="space-y-3">
            <div>
              <label className="text-muted-foreground block mb-1 font-medium">
                Set Document Open Password:
              </label>
              <input
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-hidden focus:border-primary text-xs"
              />
            </div>

            {password && (
              <div>
                <label className="text-muted-foreground block mb-1 font-medium">
                  Confirm Password:
                </label>
                <input
                  type="password"
                  placeholder="Repeat password..."
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError(null);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-hidden focus:border-primary text-xs"
                />
              </div>
            )}

            {error && <p className="text-red-500 text-[11px] font-medium">{error}</p>}
          </div>

          <div className="border-t border-border pt-3 space-y-2.5">
            <span className="font-semibold text-foreground block">
              Document Permissions:
            </span>

            <label className="flex items-center gap-2 text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={allowPrinting}
                onChange={(e) => setAllowPrinting(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span>Allow high-resolution printing</span>
            </label>

            <label className="flex items-center gap-2 text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={allowCopying}
                onChange={(e) => setAllowCopying(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span>Allow copying text and graphic contents</span>
            </label>

            <label className="flex items-center gap-2 text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={allowModifying}
                onChange={(e) => setAllowModifying(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span>Allow modifying document pages & content</span>
            </label>

            <label className="flex items-center gap-2 text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={allowAnnotating}
                onChange={(e) => setAllowAnnotating(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span>Allow adding comments and form filling</span>
            </label>
          </div>

          <div className="p-3 bg-muted/40 rounded-lg border border-border/60 text-[11px] text-muted-foreground flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Encryption runs 100% locally in your browser memory before export.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border bg-muted/30 flex items-center justify-between">
          {security.isEncrypted ? (
            <button
              onClick={handleRemoveProtection}
              className="text-xs text-red-600 hover:underline flex items-center gap-1"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Remove Password</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Security Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
