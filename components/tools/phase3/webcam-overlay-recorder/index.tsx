"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  OverlayPosition,
  BubbleSize,
  BubbleShape,
  DEFAULT_OVERLAY_CONFIG,
  calculateBubbleCoordinates,
} from "./logic";
import {
  RecorderState,
  formatRecordingTime,
  formatFileSize,
} from "../desktop-screen-recorder/logic";
import {
  Video,
  Play,
  Pause,
  Square,
  Download,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  Mic,
  MicOff,
  Move,
  Maximize2,
} from "lucide-react";

export default function WebcamOverlayRecorderTool() {
  const [recorderState, setRecorderState] = useState<RecorderState>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [position, setPosition] = useState<OverlayPosition>("bottom-right");
  const [size, setSize] = useState<BubbleSize>("medium");
  const [shape, setShape] = useState<BubbleShape>("circle");
  const [micEnabled, setMicEnabled] = useState<boolean>(true);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const [recordedBlobSize, setRecordedBlobSize] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);

  const screenStreamRef = useRef<MediaStream | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Stop all media tracks
  const stopAllMedia = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach((t) => t.stop());
      webcamStreamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopAllMedia();
    };
  }, [stopAllMedia]);

  const drawCompositedFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const screenVid = screenVideoRef.current;
    const camVid = webcamVideoRef.current;
    if (!canvas || !screenVid || !camVid) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Draw screen capture
    if (screenVid.readyState >= 2) {
      ctx.drawImage(screenVid, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 2. Draw webcam bubble
    if (camVid.readyState >= 2) {
      const bubble = calculateBubbleCoordinates(canvas.width, canvas.height, {
        position,
        size,
        shape,
        margin: 32,
      });

      ctx.save();

      // Drop shadow around bubble
      ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;

      if (shape === "circle") {
        ctx.beginPath();
        ctx.arc(
          bubble.x + bubble.radius,
          bubble.y + bubble.radius,
          bubble.radius,
          0,
          Math.PI * 2
        );
        ctx.closePath();
      } else {
        // rounded rect
        const r = 24;
        ctx.beginPath();
        ctx.roundRect(bubble.x, bubble.y, bubble.width, bubble.height, r);
        ctx.closePath();
      }

      ctx.clip();

      // Center-crop webcam feed into bubble square
      const camW = camVid.videoWidth || 640;
      const camH = camVid.videoHeight || 480;
      const cropSize = Math.min(camW, camH);
      const cropX = (camW - cropSize) / 2;
      const cropY = (camH - cropSize) / 2;

      ctx.drawImage(
        camVid,
        cropX,
        cropY,
        cropSize,
        cropSize,
        bubble.x,
        bubble.y,
        bubble.width,
        bubble.height
      );

      ctx.restore();

      // Outer ring border
      ctx.save();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#ffffff";
      if (shape === "circle") {
        ctx.beginPath();
        ctx.arc(
          bubble.x + bubble.radius,
          bubble.y + bubble.radius,
          bubble.radius,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.roundRect(bubble.x, bubble.y, bubble.width, bubble.height, 24);
        ctx.stroke();
      }
      ctx.restore();
    }

    animFrameRef.current = requestAnimationFrame(drawCompositedFrame);
  }, [position, size, shape]);

  const startRecording = async () => {
    setErrorMessage(null);
    chunksRef.current = [];

    if (!navigator?.mediaDevices?.getDisplayMedia || !navigator?.mediaDevices?.getUserMedia) {
      setErrorMessage("Screen/Webcam capture is not supported in this browser.");
      setRecorderState("error");
      return;
    }

    try {
      // 1. Get Screen Stream
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: true,
      });
      screenStreamRef.current = screenStream;

      // 2. Get Webcam Stream
      const webcamStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 } },
        audio: micEnabled ? { echoCancellation: true, noiseSuppression: true } : false,
      });
      webcamStreamRef.current = webcamStream;

      // Connect streams to hidden video elements
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = screenStream;
        await screenVideoRef.current.play();
      }
      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = webcamStream;
        await webcamVideoRef.current.play();
      }

      // Initialize canvas dimensions to screen video resolution
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Canvas is unavailable");
      canvas.width = screenVideoRef.current?.videoWidth || 1920;
      canvas.height = screenVideoRef.current?.videoHeight || 1080;

      // Start animation frame compositing loop
      animFrameRef.current = requestAnimationFrame(drawCompositedFrame);

      // 3. Capture Canvas Stream
      const canvasStream: MediaStream = (canvas as HTMLCanvasElement & { captureStream: (fps: number) => MediaStream }).captureStream(30);

      // Add audio tracks (mic + optional system audio)
      const audioTracks: MediaStreamTrack[] = [
        ...webcamStream.getAudioTracks(),
        ...screenStream.getAudioTracks(),
      ];
      audioTracks.forEach((track) => canvasStream.addTrack(track));

      const firstScreenTrack = screenStream.getVideoTracks()[0];
      if (firstScreenTrack) {
        firstScreenTrack.onended = () => {
          stopRecording();
        };
      }

      const mimeTypes = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
        "video/mp4",
      ];
      const selectedMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || "video/webm";

      const mediaRecorder = new MediaRecorder(canvasStream, { mimeType: selectedMime });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const fullBlob = new Blob(chunksRef.current, { type: selectedMime });
        setRecordedBlobSize(fullBlob.size);
        setRecordedBlobUrl(URL.createObjectURL(fullBlob));
        setRecorderState("stopped");
        stopAllMedia();
      };

      mediaRecorder.start(1000);
      setRecorderState("recording");
      setElapsedSeconds(0);

      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      stopAllMedia();
      const error = err as Error;
      if (error?.name === "NotAllowedError") {
        setErrorMessage("Screen or Webcam permission was denied.");
      } else {
        setErrorMessage(error?.message || "Failed to start webcam overlay recording.");
      }
      setRecorderState("idle");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      if (timerRef.current) clearInterval(timerRef.current);
      setRecorderState("paused");
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
      setRecorderState("recording");
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      (mediaRecorderRef.current.state === "recording" || mediaRecorderRef.current.state === "paused")
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  const resetRecording = () => {
    if (recordedBlobUrl) URL.revokeObjectURL(recordedBlobUrl);
    setRecordedBlobUrl(null);
    setRecordedBlobSize(0);
    setElapsedSeconds(0);
    setRecorderState("idle");
    setErrorMessage(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Hidden helper videos */}
      <video ref={screenVideoRef} playsInline muted className="hidden" />
      <video ref={webcamVideoRef} playsInline muted className="hidden" />

      {/* Privacy Notice */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Webcam Overlay Recorder — Video & webcam bubble are combined in client-side HTML Canvas. Zero uploads.</span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl flex items-start gap-3 text-xs text-rose-800 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Permission / Device Error</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Console Box */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6">
        {/* Top bar with Bubble Customization */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Move className="w-3.5 h-3.5" /> Corner:
            </label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value as OverlayPosition)}
              className="text-xs px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <option value="bottom-right">Bottom-Right</option>
              <option value="bottom-left">Bottom-Left</option>
              <option value="top-right">Top-Right</option>
              <option value="top-left">Top-Left</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5" /> Bubble Size:
            </label>
            <div className="flex gap-1">
              {(["small", "medium", "large"] as BubbleSize[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`px-2.5 py-0.5 text-xs rounded-md capitalize transition-colors ${
                    size === s
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShape(shape === "circle" ? "rounded-rect" : "circle")}
              className="px-2.5 py-1 text-xs border rounded-md border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize"
            >
              Shape: {shape === "circle" ? "Circular Bubble" : "Rounded Box"}
            </button>
          </div>
        </div>

        {/* Live Canvas Monitor */}
        <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-video max-w-2xl mx-auto shadow-inner flex items-center justify-center">
          <canvas ref={canvasRef} className="w-full h-full object-contain" />

          {recorderState === "idle" && (
            <div className="absolute inset-0 bg-slate-950/70 flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center">
                <Video className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Screen + Circular Webcam Overlay</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click below to grant screen & webcam access. Both are rendered locally.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Timer & Controls */}
        <div className="flex flex-col items-center justify-center space-y-4 pt-2">
          <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white">
            {formatRecordingTime(elapsedSeconds)}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {recorderState === "idle" && (
              <>
                <button
                  type="button"
                  onClick={() => setMicEnabled(!micEnabled)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-colors ${
                    micEnabled
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
                      : "border-slate-300 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {micEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                  {micEnabled ? "Mic Narration On" : "Mic Muted"}
                </button>

                <Button
                  size="lg"
                  onClick={startRecording}
                  className="bg-rose-600 hover:bg-rose-700 text-white gap-2 font-medium px-6"
                >
                  <Play className="w-4 h-4 fill-white" /> Start Overlay Recording
                </Button>
              </>
            )}

            {recorderState === "recording" && (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={pauseRecording}
                  className="gap-2 border-slate-300 dark:border-slate-700"
                >
                  <Pause className="w-4 h-4" /> Pause
                </Button>
                <Button
                  size="lg"
                  onClick={stopRecording}
                  className="bg-rose-600 hover:bg-rose-700 text-white gap-2"
                >
                  <Square className="w-4 h-4 fill-white" /> Stop & Save
                </Button>
              </>
            )}

            {recorderState === "paused" && (
              <>
                <Button
                  size="lg"
                  onClick={resumeRecording}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                >
                  <Play className="w-4 h-4 fill-white" /> Resume
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={stopRecording}
                  className="border-slate-300 dark:border-slate-700 gap-2"
                >
                  <Square className="w-4 h-4" /> Stop & Save
                </Button>
              </>
            )}

            {recorderState === "stopped" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetRecording}
                  className="gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> New Overlay Recording
                </Button>

                {recordedBlobUrl && (
                  <a
                    href={recordedBlobUrl}
                    download={`webcam-overlay-${Date.now()}.webm`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
                  >
                    <Download className="w-4 h-4" /> Download WebM ({formatFileSize(recordedBlobSize)})
                  </a>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Video Preview */}
      {recordedBlobUrl && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Video className="w-4 h-4 text-emerald-600" /> Overlay Video Playback
            </h3>
            <span className="text-xs font-mono text-slate-500">
              Duration: {formatRecordingTime(elapsedSeconds)} | Size: {formatFileSize(recordedBlobSize)}
            </span>
          </div>

          <div className="rounded-xl overflow-hidden bg-black aspect-video max-w-3xl mx-auto shadow-inner">
            <video src={recordedBlobUrl} controls className="w-full h-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
