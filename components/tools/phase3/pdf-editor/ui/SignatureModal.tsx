import React, { useState, useRef, useEffect } from "react";
import { X, Check, RotateCcw, PenTool, Type, Upload as UploadIcon } from "lucide-react";

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySignature: (dataUrl: string, type: "signature" | "initials") => void;
  initialTab?: "draw" | "type" | "upload" | "initials";
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onApplySignature,
  initialTab = "draw",
}) => {
  const [activeTab, setActiveTab] = useState<"draw" | "type" | "upload" | "initials">(initialTab);
  const [typedName, setTypedName] = useState("");
  const [selectedFontIndex, setSelectedFontIndex] = useState(0);
  const [signatureColor, setSignatureColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2.5);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [removeBackground, setRemoveBackground] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  // Reset drawing canvas when switching to draw or opening
  useEffect(() => {
    if ((activeTab === "draw" || activeTab === "initials") && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasDrawn(false);
      }
    }
  }, [activeTab, isOpen]);

  if (!isOpen) return null;

  // Drawing event handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const touch = "touches" in e && e.touches.length > 0 ? e.touches[0] : null;
    const clientX = touch ? touch.clientX : (e as React.MouseEvent).clientX;
    const clientY = touch ? touch.clientY : (e as React.MouseEvent).clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    isDrawing.current = true;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = signatureColor;
    ctx.lineWidth = strokeWidth;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const touch = "touches" in e && e.touches.length > 0 ? e.touches[0] : null;
    const clientX = touch ? touch.clientX : (e as React.MouseEvent).clientX;
    const clientY = touch ? touch.clientY : (e as React.MouseEvent).clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // Convert typed text to PNG
  const renderTypedToImage = (): string | null => {
    if (!typedName.trim()) return null;
    const canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 140;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = signatureColor;

    const fontStyles = [
      "italic 42px 'Brush Script MT', 'Dancing Script', cursive",
      "italic bold 38px 'Segoe Script', 'Great Vibes', cursive",
      "italic 40px 'Lucida Handwriting', 'Pacifico', cursive",
      "italic 36px 'Apple Chancery', 'Caveat', cursive",
    ];

    ctx.font = fontStyles[selectedFontIndex] || fontStyles[0] || "italic 40px cursive";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);

    return canvas.toDataURL("image/png");
  };

  // Handle uploaded image file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);

        if (removeBackground) {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            if (r !== undefined && g !== undefined && b !== undefined && r > 220 && g > 220 && b > 220) {
              data[i + 3] = 0;
            }
          }
          ctx.putImageData(imgData, 0, 0);
        }

        setUploadedImage(canvas.toDataURL("image/png"));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleApply = () => {
    let resultUrl: string | null = null;
    const type = activeTab === "initials" ? "initials" : "signature";

    if (activeTab === "draw" || activeTab === "initials") {
      if (canvasRef.current && hasDrawn) {
        resultUrl = canvasRef.current.toDataURL("image/png");
      }
    } else if (activeTab === "type") {
      resultUrl = renderTypedToImage();
    } else if (activeTab === "upload") {
      resultUrl = uploadedImage;
    }

    if (resultUrl) {
      onApplySignature(resultUrl, type);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-card text-foreground border border-border w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PenTool className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">
              {activeTab === "initials" ? "Create Initials" : "Create Signature"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-border bg-muted/40 px-5 pt-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab("draw")}
            className={`pb-2 px-3 font-medium border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "draw"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Draw</span>
          </button>
          <button
            onClick={() => setActiveTab("type")}
            className={`pb-2 px-3 font-medium border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "type"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Type</span>
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`pb-2 px-3 font-medium border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "upload"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <UploadIcon className="w-3.5 h-3.5" />
            <span>Upload</span>
          </button>
          <button
            onClick={() => setActiveTab("initials")}
            className={`pb-2 px-3 font-medium border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "initials"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Initials</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 flex-1 space-y-4">
          {/* DRAW / INITIALS TAB */}
          {(activeTab === "draw" || activeTab === "initials") && (
            <div className="space-y-3">
              <div className="relative border-2 border-dashed border-border rounded-lg bg-background overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={460}
                  height={180}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-44 cursor-crosshair touch-none"
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-muted-foreground text-xs">
                    Sign with your mouse, trackpad, or finger here
                  </div>
                )}
                {/* Baseline line */}
                <div className="absolute left-8 right-8 bottom-8 border-b border-border/60 pointer-events-none" />
              </div>

              {/* Color & Stroke Controls */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Color:</span>
                  {[
                    { hex: "#000000", label: "Black" },
                    { hex: "#1d4ed8", label: "Blue" },
                    { hex: "#0f766e", label: "Teal" },
                  ].map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => setSignatureColor(c.hex)}
                      className={`w-5 h-5 rounded-full ${
                        signatureColor === c.hex ? "ring-2 ring-primary ring-offset-2" : ""
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Stroke:</span>
                  {[1.5, 2.5, 4].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStrokeWidth(s)}
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        strokeWidth === s ? "bg-primary text-primary-foreground font-semibold" : "bg-muted"
                      }`}
                    >
                      {s === 1.5 ? "Fine" : s === 2.5 ? "Medium" : "Bold"}
                    </button>
                  ))}
                  <button
                    onClick={clearCanvas}
                    className="ml-2 inline-flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TYPE TAB */}
          {activeTab === "type" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Type your full name or initials:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Johnathan Doe"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:border-primary"
                />
              </div>

              {typedName && (
                <div className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Select typography signature style:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { font: "font-serif italic font-bold", label: "Style 1: Script Bold" },
                      { font: "italic font-mono tracking-wider", label: "Style 2: Elegant Monospace" },
                      { font: "font-sans italic font-semibold", label: "Style 3: Modern Script" },
                      { font: "italic tracking-widest", label: "Style 4: Classic Calligraphy" },
                    ].map((style, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedFontIndex(idx)}
                        className={`p-3 rounded-lg border text-center cursor-pointer transition-all ${
                          selectedFontIndex === idx
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        <p className={`text-xl truncate ${style.font}`} style={{ color: signatureColor }}>
                          {typedName}
                        </p>
                        <span className="text-[10px] text-muted-foreground block mt-1">
                          {style.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* UPLOAD TAB */}
          {activeTab === "upload" && (
            <div className="space-y-3">
              <label className="block border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary cursor-pointer bg-background">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <UploadIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <span className="text-xs font-medium text-foreground block">
                  Click to select PNG or JPEG signature
                </span>
                <span className="text-[11px] text-muted-foreground block mt-1">
                  Transformed 100% in local browser memory
                </span>
              </label>

              {uploadedImage && (
                <div className="space-y-2">
                  <div className="h-28 border border-border rounded-lg bg-white flex items-center justify-center p-2">
                    <img src={uploadedImage} alt="Uploaded signature" className="max-h-full object-contain" />
                  </div>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={removeBackground}
                      onChange={(e) => setRemoveBackground(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <span>Automatically remove white background</span>
                  </label>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border bg-muted/30 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply to Document</span>
          </button>
        </div>
      </div>
    </div>
  );
};
