"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  AudioRecorderState,
  formatAudioTime,
  formatAudioFileSize,
  encodeAudioBufferToWav,
  sliceAudioBuffer,
} from "./logic";
import {
  Mic,
  MicOff,
  Square,
  Pause,
  Play,
  RotateCcw,
  Download,
  ShieldCheck,
  AlertCircle,
  Sliders,
  Scissors,
  ArrowRight,
  Music,
  Volume2,
} from "lucide-react";

export default function VoiceRecorderTool() {
  const [recorderState, setRecorderState] = useState<AudioRecorderState>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Audio Buffers & Output Blobs
  const [originalAudioBuffer, setOriginalAudioBuffer] = useState<AudioBuffer | null>(null);
  const [trimmedAudioBuffer, setTrimmedAudioBuffer] = useState<AudioBuffer | null>(null);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [wavBlobUrl, setWavBlobUrl] = useState<string | null>(null);
  const [wavBlobSize, setWavBlobSize] = useState<number>(0);

  // Trimming State
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(0);
  const [totalDuration, setTotalDuration] = useState<number>(0);

  // Hardware / Stream Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Clean up all tracks, audio context, and timers
  const cleanupStreams = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanupStreams();
      if (audioBlobUrl) URL.revokeObjectURL(audioBlobUrl);
      if (wavBlobUrl) URL.revokeObjectURL(wavBlobUrl);
    };
  }, [cleanupStreams, audioBlobUrl, wavBlobUrl]);

  // Real-time Waveform Canvas Visualizer
  const drawLiveVisualizer = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const renderFrame = () => {
      animationFrameRef.current = requestAnimationFrame(renderFrame);
      analyser.getByteFrequencyData(dataArray);

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Draw frequency bars
      const barWidth = (width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const val = dataArray[i] ?? 0;
        const barHeight = (val / 255) * height * 0.9;

        // Gradient from blue to indigo
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, "#3B82F6");
        gradient.addColorStop(1, "#6366F1");

        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
        if (x > width) break;
      }
    };

    renderFrame();
  }, []);

  // Draw Static Waveform Preview when stopped
  const drawStaticWaveform = useCallback((buffer: AudioBuffer) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const data = buffer.getChannelData(0);
    const step = Math.ceil(data.length / width);
    const amp = height / 2;

    ctx.fillStyle = "#3B82F6";
    ctx.beginPath();
    ctx.moveTo(0, amp);

    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = data[i * step + j] ?? 0;
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      ctx.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
    }
  }, []);

  // Start Recording
  const startRecording = async () => {
    setErrorMessage(null);
    chunksRef.current = [];

    if (!navigator?.mediaDevices?.getUserMedia) {
      setErrorMessage("Your browser does not support microphone audio capture.");
      setRecorderState("error");
      return;
    }

    try {
      // 1. Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      // 2. Setup Web Audio API Analyser
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      audioContextRef.current = audioCtx;

      const sourceNode = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      sourceNode.connect(analyser);
      analyserRef.current = analyser;

      // 3. Setup MediaRecorder
      const mimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/mp4",
      ];
      const selectedMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || "";

      const mediaRecorder = new MediaRecorder(
        stream,
        selectedMime ? { mimeType: selectedMime } : undefined
      );
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const fullBlob = new Blob(chunksRef.current, {
          type: selectedMime || "audio/webm",
        });
        const url = URL.createObjectURL(fullBlob);
        setAudioBlobUrl(url);

        // Decode into AudioBuffer for WAV conversion & trimming
        try {
          const arrayBuffer = await fullBlob.arrayBuffer();
          const decoded = await audioCtx.decodeAudioData(arrayBuffer);
          setOriginalAudioBuffer(decoded);
          setTrimmedAudioBuffer(decoded);
          setTotalDuration(decoded.duration);
          setTrimStart(0);
          setTrimEnd(decoded.duration);

          // Generate initial 16-bit WAV
          const wavBuffer = encodeAudioBufferToWav(decoded);
          const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });
          setWavBlobSize(wavBlob.size);
          const wavUrl = URL.createObjectURL(wavBlob);
          setWavBlobUrl(wavUrl);

          // Draw static waveform preview
          drawStaticWaveform(decoded);
        } catch (decErr) {
          console.warn("Failed to decode recorded audio for WAV export:", decErr);
        }

        cleanupStreams();
        setRecorderState("stopped");
      };

      mediaRecorder.start(1000); // 1s slice
      setRecorderState("recording");
      setElapsedSeconds(0);

      // Start duration timer
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);

      // Start live visualizer
      drawLiveVisualizer();
    } catch (err: unknown) {
      cleanupStreams();
      const error = err as Error;
      if (error?.name === "NotAllowedError" || error?.name === "PermissionDeniedError") {
        setErrorMessage(
          "Microphone permission was denied. Please allow microphone access in your browser settings to record voice audio."
        );
      } else {
        setErrorMessage(error?.message || "Failed to initialize microphone recording.");
      }
      setRecorderState("error");
    }
  };

  // Pause Recording
  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      setRecorderState("paused");
    }
  };

  // Resume Recording
  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
      drawLiveVisualizer();
      setRecorderState("recording");
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      (mediaRecorderRef.current.state === "recording" ||
        mediaRecorderRef.current.state === "paused")
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  // Reset Recording
  const resetRecording = () => {
    cleanupStreams();
    if (audioBlobUrl) URL.revokeObjectURL(audioBlobUrl);
    if (wavBlobUrl) URL.revokeObjectURL(wavBlobUrl);
    setAudioBlobUrl(null);
    setWavBlobUrl(null);
    setWavBlobSize(0);
    setOriginalAudioBuffer(null);
    setTrimmedAudioBuffer(null);
    setElapsedSeconds(0);
    setTotalDuration(0);
    setTrimStart(0);
    setTrimEnd(0);
    setErrorMessage(null);
    setRecorderState("idle");

    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Apply In-Memory Trim
  const applyTrim = () => {
    if (!originalAudioBuffer) return;

    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtxClass();
      const sliced = sliceAudioBuffer(ctx, originalAudioBuffer, trimStart, trimEnd);
      setTrimmedAudioBuffer(sliced);

      // Re-encode trimmed WAV
      const wavBuffer = encodeAudioBufferToWav(sliced);
      const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });
      setWavBlobSize(wavBlob.size);

      if (wavBlobUrl) URL.revokeObjectURL(wavBlobUrl);
      const newWavUrl = URL.createObjectURL(wavBlob);
      setWavBlobUrl(newWavUrl);

      // Draw updated waveform
      drawStaticWaveform(sliced);
      ctx.close();
    } catch (trimErr) {
      console.error("Failed to slice audio buffer:", trimErr);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Privacy Guarantee Badge */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            Voice & Podcast Audio Recorder — Microphone stream is encoded directly in RAM and never uploaded to any server.
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl flex items-start gap-3 text-xs text-rose-800 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Microphone Error</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Console Box */}
      <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-center space-y-6">
        {/* Status Indicator Icon */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              recorderState === "recording"
                ? "bg-rose-100 dark:bg-rose-900/40 text-rose-600 animate-pulse ring-8 ring-rose-50 dark:ring-rose-950"
                : recorderState === "paused"
                ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600"
                : recorderState === "stopped"
                ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            }`}
          >
            <Mic className="w-10 h-10" />
          </div>

          <div>
            <div className="font-mono text-3xl font-bold text-slate-900 dark:text-white tracking-wider">
              {formatAudioTime(elapsedSeconds)}
            </div>
            <p className="text-xs text-slate-500 mt-1 capitalize">
              Status:{" "}
              {recorderState === "idle"
                ? "Ready to Record"
                : recorderState === "recording"
                ? "Live Recording"
                : recorderState}
            </p>
          </div>
        </div>

        {/* Live Audio Visualizer Canvas */}
        <div className="relative w-full h-28 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner">
          <canvas
            ref={canvasRef}
            width={640}
            height={112}
            className="w-full h-full object-cover"
          />
          {recorderState === "idle" && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs font-mono">
              Microphone visualizer idle. Click &quot;Start Recording&quot; to begin.
            </div>
          )}
        </div>

        {/* Dynamic Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {recorderState === "idle" && (
            <Button
              onClick={startRecording}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Mic className="w-4 h-4" /> Start Recording
            </Button>
          )}

          {recorderState === "recording" && (
            <>
              <Button
                variant="outline"
                onClick={pauseRecording}
                className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-2 rounded-xl"
              >
                <Pause className="w-4 h-4" /> Pause
              </Button>
              <Button
                onClick={stopRecording}
                className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold px-6 py-2.5 rounded-xl flex items-center gap-2"
              >
                <Square className="w-4 h-4 fill-current" /> Stop &amp; Finish
              </Button>
            </>
          )}

          {recorderState === "paused" && (
            <>
              <Button
                onClick={resumeRecording}
                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-2 rounded-xl"
              >
                <Play className="w-4 h-4 fill-current" /> Resume
              </Button>
              <Button
                onClick={stopRecording}
                className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold px-6 py-2.5 rounded-xl flex items-center gap-2"
              >
                <Square className="w-4 h-4 fill-current" /> Stop &amp; Finish
              </Button>
            </>
          )}

          {recorderState === "stopped" && (
            <Button
              variant="outline"
              onClick={resetRecording}
              className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-2 rounded-xl"
            >
              <RotateCcw className="w-4 h-4" /> Record New Audio
            </Button>
          )}

          {recorderState === "error" && (
            <Button
              onClick={resetRecording}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Try Again
            </Button>
          )}
        </div>
      </div>

      {/* Post-Recording Studio: Playback, Trimmer & Dual Download */}
      {recorderState === "stopped" && wavBlobUrl && (
        <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Recording Preview &amp; Studio
              </h3>
            </div>
            <div className="text-xs font-mono text-slate-500">
              Duration: {formatAudioTime(trimmedAudioBuffer?.duration || totalDuration)} • Size:{" "}
              {formatAudioFileSize(wavBlobSize)}
            </div>
          </div>

          {/* HTML5 Audio Player */}
          <div className="w-full">
            <audio
              controls
              src={wavBlobUrl}
              className="w-full rounded-lg focus:outline-none"
            />
          </div>

          {/* Audio Trimmer Controls */}
          {totalDuration > 1 && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-blue-500" /> Quick Audio Trimmer
                </span>
                <span className="font-mono text-slate-500">
                  {formatAudioTime(trimStart)} — {formatAudioTime(trimEnd)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-medium text-slate-500 block mb-1">
                    Start Offset ({trimStart.toFixed(1)}s)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(0, trimEnd - 0.5)}
                    step={0.1}
                    value={trimStart}
                    onChange={(e) => setTrimStart(parseFloat(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-500 block mb-1">
                    End Offset ({trimEnd.toFixed(1)}s)
                  </label>
                  <input
                    type="range"
                    min={Math.min(totalDuration, trimStart + 0.5)}
                    max={totalDuration}
                    step={0.1}
                    value={trimEnd}
                    onChange={(e) => setTrimEnd(parseFloat(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={applyTrim}
                  className="text-xs flex items-center gap-1.5 rounded-lg border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                >
                  <Scissors className="w-3.5 h-3.5" /> Apply Trim
                </Button>
              </div>
            </div>
          )}

          {/* Export & Chaining Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* Lossless WAV Download */}
              <a
                href={wavBlobUrl}
                download={`voice-recording-${Date.now()}.wav`}
                className="w-full sm:w-auto"
              >
                <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Download WAV (Lossless)
                </Button>
              </a>

              {/* Compressed WebM Download */}
              {audioBlobUrl && (
                <a
                  href={audioBlobUrl}
                  download={`voice-recording-${Date.now()}.webm`}
                  className="w-full sm:w-auto"
                >
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download WebM
                  </Button>
                </a>
              )}
            </div>

            {/* Chaining: Convert WAV to MP3 */}
            <Link
              href="/tools/audio/wav-to-mp3"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline px-3 py-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl"
            >
              <span>Convert to MP3</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
