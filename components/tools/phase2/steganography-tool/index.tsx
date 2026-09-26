"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  calculateStegoCapacity,
  encodeStegoMessage,
  decodeStegoMessage,
} from "./logic";
import {
  Eye,
  EyeOff,
  Upload,
  Download,
  Copy,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  FileImage,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Lock,
  Unlock,
} from "lucide-react";

export default function SteganographyTool() {
  const [activeTab, setActiveTab] = useState<"encode" | "decode">("encode");

  // Encode state
  const [carrierImage, setCarrierImage] = useState<File | null>(null);
  const [carrierUrl, setCarrierUrl] = useState<string | null>(null);
  const [carrierDimensions, setCarrierDimensions] = useState<{ width: number; height: number } | null>(null);
  const [secretMessage, setSecretMessage] = useState<string>("");
  const [encodePassphrase, setEncodePassphrase] = useState<string>("");
  const [showEncodePass, setShowEncodePass] = useState<boolean>(false);
  const [encodedBlobUrl, setEncodedBlobUrl] = useState<string | null>(null);
  const [isEncoding, setIsEncoding] = useState<boolean>(false);

  // Decode state
  const [stegoImage, setStegoImage] = useState<File | null>(null);
  const [stegoUrl, setStegoUrl] = useState<string | null>(null);
  const [decodePassphrase, setDecodePassphrase] = useState<string>("");
  const [showDecodePass, setShowDecodePass] = useState<boolean>(false);
  const [revealedMessage, setRevealedMessage] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);

  const encodeInputRef = useRef<HTMLInputElement | null>(null);
  const decodeInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    return () => {
      if (carrierUrl) URL.revokeObjectURL(carrierUrl);
      if (encodedBlobUrl) URL.revokeObjectURL(encodedBlobUrl);
      if (stegoUrl) URL.revokeObjectURL(stegoUrl);
    };
  }, [carrierUrl, encodedBlobUrl, stegoUrl]);

  // Capacity calculation
  const capacity = React.useMemo(() => {
    if (!carrierDimensions) return null;
    return calculateStegoCapacity(carrierDimensions.width, carrierDimensions.height);
  }, [carrierDimensions]);

  // Handle carrier upload
  const handleCarrierSelect = (file: File) => {
    setError(null);
    setEncodedBlobUrl(null);
    setCarrierImage(file);

    if (carrierUrl) URL.revokeObjectURL(carrierUrl);
    const url = URL.createObjectURL(file);
    setCarrierUrl(url);

    const img = new Image();
    img.onload = () => {
      setCarrierDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = url;
  };

  // Handle stego image upload
  const handleStegoSelect = (file: File) => {
    setError(null);
    setRevealedMessage(null);
    setStegoImage(file);

    if (stegoUrl) URL.revokeObjectURL(stegoUrl);
    const url = URL.createObjectURL(file);
    setStegoUrl(url);
  };

  // Encode logic
  const handleEncode = async () => {
    if (!carrierImage || !carrierUrl || !carrierDimensions) {
      setError("Please upload a carrier image first.");
      return;
    }
    if (!secretMessage.trim()) {
      setError("Please enter a secret message to embed.");
      return;
    }

    setIsEncoding(true);
    setError(null);

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          setError("Failed to initialize canvas context.");
          setIsEncoding(false);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const result = encodeStegoMessage(imageData.data, secretMessage, encodePassphrase);
        if (!result.success) {
          setError(result.error || "Failed to encode message into image.");
          setIsEncoding(false);
          return;
        }

        ctx.putImageData(imageData, 0, 0);

        canvas.toBlob((blob) => {
          if (!blob) {
            setError("Failed to generate stego PNG blob.");
            setIsEncoding(false);
            return;
          }
          if (encodedBlobUrl) URL.revokeObjectURL(encodedBlobUrl);
          const outUrl = URL.createObjectURL(blob);
          setEncodedBlobUrl(outUrl);
          setIsEncoding(false);
        }, "image/png");
      };
      img.src = carrierUrl;
    } catch (err: any) {
      setError(err?.message || "Steganography encoding error.");
      setIsEncoding(false);
    }
  };

  // Decode logic
  const handleDecode = async () => {
    if (!stegoImage || !stegoUrl) {
      setError("Please select a stego image to decode.");
      return;
    }

    setIsDecoding(true);
    setError(null);

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          setError("Failed to initialize canvas context.");
          setIsDecoding(false);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const result = decodeStegoMessage(imageData.data, decodePassphrase);
        if (!result.success) {
          setError(result.error || "Failed to decode secret message.");
          setIsDecoding(false);
          return;
        }

        setRevealedMessage(result.message || "");
        setIsDecoding(false);
      };
      img.src = stegoUrl;
    } catch (err: any) {
      setError(err?.message || "Steganography decoding error.");
      setIsDecoding(false);
    }
  };

  const handleCopy = async () => {
    if (!revealedMessage) return;
    try {
      await navigator.clipboard.writeText(revealedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Privacy Guarantee Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-sm font-medium">
            100% In-Browser LSB Image Steganography • Zero Cloud Uploads
          </div>
        </div>
        <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full font-semibold">
          Hardware Canvas Sandbox
        </span>
      </div>

      {/* Mode Selector */}
      <div className="flex items-center justify-center">
        <div className="flex bg-muted/60 p-1 rounded-xl border">
          <button
            type="button"
            onClick={() => {
              setActiveTab("encode");
              setError(null);
            }}
            className={`flex items-center gap-2 px-6 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === "encode"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Lock className="w-3.5 h-3.5" /> Hide Secret Message (Encode)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("decode");
              setError(null);
            }}
            className={`flex items-center gap-2 px-6 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === "decode"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Unlock className="w-3.5 h-3.5" /> Reveal Secret Message (Decode)
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Encode Tab */}
      {activeTab === "encode" && (
        <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Carrier Image Upload */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <FileImage className="w-3.5 h-3.5 text-primary" /> Carrier Image
              </label>

              {!carrierImage ? (
                <div
                  onClick={() => encodeInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer.files?.[0];
                    if (f) handleCarrierSelect(f);
                  }}
                  className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary/60 transition bg-muted/20 hover:bg-muted/40 h-52 flex flex-col items-center justify-center"
                >
                  <input
                    type="file"
                    ref={encodeInputRef}
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleCarrierSelect(f);
                    }}
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 text-primary mb-2 opacity-80" />
                  <p className="text-xs font-semibold text-foreground">Select Carrier Photo</p>
                  <p className="text-[11px] text-muted-foreground mt-1">PNG, WebP, JPG, or BMP</p>
                </div>
              ) : (
                <div className="border rounded-xl p-3 bg-muted/20 space-y-3">
                  {carrierUrl && (
                    <div className="h-36 rounded-lg overflow-hidden bg-black/5 flex items-center justify-center">
                      <img
                        src={carrierUrl}
                        alt="Carrier Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="truncate max-w-[180px]">{carrierImage.name}</span>
                    {carrierDimensions && capacity && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        Cap: ~{(capacity.maxBytes / 1024).toFixed(1)} KB
                      </span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCarrierImage(null);
                      setCarrierUrl(null);
                      setCarrierDimensions(null);
                      setEncodedBlobUrl(null);
                    }}
                    className="w-full text-xs h-7"
                  >
                    Change Image
                  </Button>
                </div>
              )}
            </div>

            {/* Right: Message & Passphrase */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground flex items-center justify-between mb-1.5">
                  <span>Secret Message to Hide</span>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {secretMessage.length.toLocaleString()} characters
                  </span>
                </label>
                <textarea
                  value={secretMessage}
                  onChange={(e) => setSecretMessage(e.target.value)}
                  placeholder="Type or paste the confidential message to invisibly embed inside pixels..."
                  className="w-full h-32 p-3 text-xs bg-background border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-primary" /> Optional Passphrase (Stego Key)
                </label>
                <div className="relative">
                  <input
                    type={showEncodePass ? "text" : "password"}
                    value={encodePassphrase}
                    onChange={(e) => setEncodePassphrase(e.target.value)}
                    placeholder="Optional passphrase for extra cryptographic layer..."
                    className="w-full text-xs bg-background border rounded-lg pl-3 pr-9 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEncodePass((prev) => !prev)}
                    className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground"
                  >
                    {showEncodePass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button & Result */}
          <div className="pt-2 border-t flex flex-wrap items-center justify-between gap-4">
            {!encodedBlobUrl ? (
              <Button
                onClick={handleEncode}
                disabled={isEncoding || !carrierImage || !secretMessage.trim()}
                className="gap-2 bg-primary text-primary-foreground font-semibold px-6 shadow-sm hover:opacity-95"
              >
                <Lock className="w-4 h-4" />
                {isEncoding ? "Embedding Message into Pixels..." : "Invisibly Embed & Generate PNG"}
              </Button>
            ) : (
              <div className="w-full p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800 rounded-xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-bold">Secret Message Successfully Embedded!</p>
                    <p className="text-xs opacity-90">
                      Exported as lossless PNG to protect pixel bits from compression damage.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={encodedBlobUrl}
                    download="stego_image.png"
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Stego-PNG
                  </a>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEncodedBlobUrl(null);
                      setSecretMessage("");
                    }}
                  >
                    Embed Another
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Decode Tab */}
      {activeTab === "decode" && (
        <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Stego Image Upload */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <FileImage className="w-3.5 h-3.5 text-primary" /> Steganographic Image to Decode
              </label>

              {!stegoImage ? (
                <div
                  onClick={() => decodeInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer.files?.[0];
                    if (f) handleStegoSelect(f);
                  }}
                  className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary/60 transition bg-muted/20 hover:bg-muted/40 h-52 flex flex-col items-center justify-center"
                >
                  <input
                    type="file"
                    ref={decodeInputRef}
                    accept="image/png,image/bmp"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleStegoSelect(f);
                    }}
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 text-primary mb-2 opacity-80" />
                  <p className="text-xs font-semibold text-foreground">Select Stego PNG Image</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Must be lossless PNG</p>
                </div>
              ) : (
                <div className="border rounded-xl p-3 bg-muted/20 space-y-3">
                  {stegoUrl && (
                    <div className="h-36 rounded-lg overflow-hidden bg-black/5 flex items-center justify-center">
                      <img
                        src={stegoUrl}
                        alt="Stego Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="truncate max-w-[200px]">{stegoImage.name}</span>
                    <span>{(stegoImage.size / 1024).toFixed(1)} KB</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStegoImage(null);
                      setStegoUrl(null);
                      setRevealedMessage(null);
                    }}
                    className="w-full text-xs h-7"
                  >
                    Change Image
                  </Button>
                </div>
              )}
            </div>

            {/* Right: Passphrase & Decode Action */}
            <div className="space-y-4 flex flex-col justify-between">
              <div>
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-primary" /> Passphrase (If Protected)
                </label>
                <div className="relative">
                  <input
                    type={showDecodePass ? "text" : "password"}
                    value={decodePassphrase}
                    onChange={(e) => setDecodePassphrase(e.target.value)}
                    placeholder="Enter passphrase if image was encrypted..."
                    className="w-full text-xs bg-background border rounded-lg pl-3 pr-9 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDecodePass((prev) => !prev)}
                    className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground"
                  >
                    {showDecodePass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <Button
                onClick={handleDecode}
                disabled={isDecoding || !stegoImage}
                className="w-full gap-2 bg-primary text-primary-foreground font-semibold py-2.5"
              >
                <Unlock className="w-4 h-4" />
                {isDecoding ? "Scanning Pixel Bitstream..." : "Extract Hidden Message"}
              </Button>
            </div>
          </div>

          {/* Revealed Secret Message Result */}
          {revealedMessage !== null && (
            <div className="p-4 bg-muted/30 border rounded-xl space-y-3 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Revealed Hidden Message:
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="text-xs h-7 gap-1"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Text
                    </>
                  )}
                </Button>
              </div>

              <div className="p-3 bg-background border rounded-lg font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {revealedMessage}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
