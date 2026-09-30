"use client";

import React, { useState, useRef } from "react";
import { ToolWorkbenchShell } from "@/components/tools/ToolWorkbenchShell";
import { ConverterPreset } from "@/lib/registry/converter-presets";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

export interface FfmpegMediaEngineProps {
  preset: ConverterPreset;
}

export function FfmpegMediaEngine({ preset }: FfmpegMediaEngineProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState<number | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const ffmpegRef = useRef<FFmpeg | null>(null);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles.slice(0, 1));
    setDownloadUrl(null);
    setErrorMessage(null);
  };

  const processMedia = async () => {
    if (files.length === 0 || !files[0]) return;
    setIsProcessing(true);
    setProgressPercent(5);
    setErrorMessage(null);

    try {
      const file = files[0];

      // Lazy load FFmpeg instance
      if (!ffmpegRef.current) {
        const ffmpeg = new FFmpeg();
        ffmpeg.on("progress", ({ progress }) => {
          setProgressPercent(Math.round(progress * 100));
        });
        await ffmpeg.load();
        ffmpegRef.current = ffmpeg;
      }

      const ffmpeg = ffmpegRef.current;
      const inputName = `input_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const outputExt = preset.outputFormat;
      const outputName = `output.${outputExt}`;

      // Write file into FFmpeg virtual MEMFS
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      // Build CLI args based on preset
      let args: string[] = [];
      if (preset.slug === "mp4-to-mp3" || preset.slug === "wav-to-mp3") {
        args = ["-i", inputName, "-vn", "-acodec", "libmp3lame", "-q:a", "2", outputName];
      } else if (preset.slug === "mov-to-mp4") {
        args = ["-i", inputName, "-vcodec", "copy", "-acodec", "copy", outputName];
      } else {
        args = ["-i", inputName, outputName];
      }

      await ffmpeg.exec(args);

      // Read output bytes from MEMFS
      const data = await ffmpeg.readFile(outputName);
      const uint8 = data instanceof Uint8Array ? data : new Uint8Array(data as unknown as ArrayBuffer);

      const mimeType =
        outputExt === "mp3"
          ? "audio/mp3"
          : outputExt === "mp4"
          ? "video/mp4"
          : "application/octet-stream";

      const blob = new Blob([uint8.buffer as ArrayBuffer], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || "converted-media";

      setDownloadUrl(url);
      setDownloadFilename(`${baseName}.${outputExt}`);
    } catch (err: any) {
      console.error("[FfmpegMediaEngine Error]:", err);
      setErrorMessage(
        err.message || "Failed to convert media file in browser memory."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setFiles([]);
    setDownloadUrl(null);
    setDownloadFilename(null);
    setProgressPercent(null);
    setErrorMessage(null);
  };

  return (
    <ToolWorkbenchShell
      acceptTypes={preset.inputFormats}
      maxFileSizeMB={preset.maxFileSizeMB}
      multipleFiles={false}
      files={files}
      onFilesSelected={handleFilesSelected}
      actionLabel={preset.actionLabel}
      onAction={processMedia}
      isProcessing={isProcessing}
      progressPercent={progressPercent}
      downloadUrl={downloadUrl}
      downloadFilename={downloadFilename}
      onReset={handleReset}
      errorMessage={errorMessage}
      isActionDisabled={files.length === 0}
      dropzoneText={`Drag & drop a file to convert (${preset.inputFormats.join(", ")})`}
    />
  );
}
