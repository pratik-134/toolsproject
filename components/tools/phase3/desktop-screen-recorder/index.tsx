"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  RecorderState,
  formatRecordingTime,
  formatFileSize,
} from "./logic";
import {
  Monitor,
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  Download,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  Video,
} from "lucide-react";

export default function DesktopScreenRecorderTool() {
  const [recorderState, setRecorderState] = useState<RecorderState>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [micEnabled, setMicEnabled] = useState<boolean>(true);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const [recordedBlobSize, setRecordedBlobSize] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const combinedStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up streams on unmount
  const stopAllTracks = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (combinedStreamRef.current) {
      combinedStreamRef.current.getTracks().forEach((t) => t.stop());
      combinedStreamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopAllTracks();
    };
  }, [stopAllTracks]);

  const startRecording = async () => {
    setErrorMessage(null);
    chunksRef.current = [];

    if (!navigator?.mediaDevices?.getDisplayMedia) {
      setErrorMessage("Your browser does not support screen recording via getDisplayMedia.");
      setRecorderState("error");
      return;
    }

    try {
      // 1. Get Screen Stream
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "monitor" },
        audio: true, // system audio if supported
      });
      screenStreamRef.current = screenStream;

      const tracks: MediaStreamTrack[] = [...screenStream.getVideoTracks()];

      // Audio tracks to combine
      const audioTracks: MediaStreamTrack[] = [...screenStream.getAudioTracks()];

      // 2. Optional Microphone
      if (micEnabled) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
            },
          });
          micStreamRef.current = micStream;
          audioTracks.push(...micStream.getAudioTracks());
        } catch (micErr) {
          console.warn("Microphone access denied or unavailable, continuing without mic:", micErr);
        }
      }

      // 3. Create AudioContext mix if multiple audio tracks
      if (audioTracks.length > 0) {
        tracks.push(...audioTracks);
      }

      const combinedStream = new MediaStream(tracks);
      combinedStreamRef.current = combinedStream;

      // Handle user clicking native "Stop sharing" bar
      const firstVideoTrack = screenStream.getVideoTracks()[0];
      if (firstVideoTrack) {
        firstVideoTrack.onended = () => {
          stopRecording();
        };
      }

      // Determine supported mime type
      const mimeTypes = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
        "video/mp4",
      ];
      const selectedMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || "video/webm";

      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: selectedMime,
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const fullBlob = new Blob(chunksRef.current, { type: selectedMime });
        setRecordedBlobSize(fullBlob.size);
        const url = URL.createObjectURL(fullBlob);
        setRecordedBlobUrl(url);
        setRecorderState("stopped");
        stopAllTracks();
      };

      mediaRecorder.start(1000); // 1-second chunks
      setRecorderState("recording");
      setElapsedSeconds(0);

      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      stopAllTracks();
      const error = err as Error;
      if (error?.name === "NotAllowedError") {
        setErrorMessage("Screen recording permission was cancelled or denied.");
      } else {
        setErrorMessage(error?.message || "Failed to start desktop screen recording.");
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
    if (recordedBlobUrl) {
      URL.revokeObjectURL(recordedBlobUrl);
    }
    setRecordedBlobUrl(null);
    setRecordedBlobSize(0);
    setElapsedSeconds(0);
    setRecorderState("idle");
    setErrorMessage(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Privacy Notice */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Full Desktop Screen Recorder — Video stream is encoded directly in RAM and never leaves your browser.</span>
        </div>
      </div>

      {/* Error State */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl flex items-start gap-3 text-xs text-rose-800 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Recording Error</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Console Box */}
      <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-center space-y-6">
        {/* State visualizer */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              recorderState === "recording"
                ? "bg-rose-100 dark:bg-rose-900/40 text-rose-600 animate-pulse ring-8 ring-rose-50 dark:ring-rose-950"
                : recorderState === "paused"
                ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            }`}
          >
            <Monitor className="w-10 h-10" />
          </div>

          <div>
            <div className="font-mono text-3xl font-bold text-slate-900 dark:text-white tracking-wider">
              {formatRecordingTime(elapsedSeconds)}
            </div>
            <p className="text-xs text-slate-500 mt-1 capitalize">
              Status: {recorderState === "idle" ? "Ready to Record" : recorderState}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
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
                {micEnabled ? "Microphone On" : "Microphone Muted"}
              </button>

              <Button
                size="lg"
                onClick={startRecording}
                className="bg-rose-600 hover:bg-rose-700 text-white gap-2 font-medium px-6"
              >
                <Play className="w-4 h-4 fill-white" /> Start Screen Capture
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
                <Square className="w-4 h-4 fill-white" /> Finish & Stop
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
                <Play className="w-4 h-4 fill-white" /> Resume Recording
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={stopRecording}
                className="border-slate-300 dark:border-slate-700 gap-2"
              >
                <Square className="w-4 h-4" /> Finish & Stop
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
                <RotateCcw className="w-3.5 h-3.5" /> Record Again
              </Button>

              {recordedBlobUrl && (
                <a
                  href={recordedBlobUrl}
                  download={`screen-recording-${Date.now()}.webm`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
                >
                  <Download className="w-4 h-4" /> Download WebM ({formatFileSize(recordedBlobSize)})
                </a>
              )}
            </>
          )}
        </div>
      </div>

      {/* Video Preview Player */}
      {recordedBlobUrl && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Video className="w-4 h-4 text-emerald-600" /> Recorded Preview Playback
            </h3>
            <span className="text-xs font-mono text-slate-500">
              Duration: {formatRecordingTime(elapsedSeconds)} | Size: {formatFileSize(recordedBlobSize)}
            </span>
          </div>

          <div className="rounded-xl overflow-hidden bg-black aspect-video max-w-3xl mx-auto shadow-inner">
            <video
              src={recordedBlobUrl}
              controls
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
