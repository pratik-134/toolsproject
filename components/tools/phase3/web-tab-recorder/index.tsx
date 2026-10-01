"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  RecorderState,
  formatRecordingTime,
  formatFileSize,
} from "../desktop-screen-recorder/logic";
import {
  Chrome,
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
  Volume2,
  VolumeX,
} from "lucide-react";

export default function WebTabRecorderTool() {
  const [recorderState, setRecorderState] = useState<RecorderState>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [micEnabled, setMicEnabled] = useState<boolean>(false);
  const [tabAudioEnabled, setTabAudioEnabled] = useState<boolean>(true);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const [recordedBlobSize, setRecordedBlobSize] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const tabStreamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const combinedStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const stopAllTracks = useCallback(() => {
    if (tabStreamRef.current) {
      tabStreamRef.current.getTracks().forEach((t) => t.stop());
      tabStreamRef.current = null;
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
      setErrorMessage("Your browser does not support tab recording via getDisplayMedia.");
      setRecorderState("error");
      return;
    }

    try {
      // Prompt specifically for browser tab
      const tabStream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "browser" },
        audio: tabAudioEnabled,
        // @ts-expect-error Chrome/Edge preferCurrentTab hint
        preferCurrentTab: true,
      });
      tabStreamRef.current = tabStream;

      const tracks: MediaStreamTrack[] = [...tabStream.getVideoTracks()];
      const audioTracks: MediaStreamTrack[] = [...tabStream.getAudioTracks()];

      if (micEnabled) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true },
          });
          micStreamRef.current = micStream;
          audioTracks.push(...micStream.getAudioTracks());
        } catch (micErr) {
          console.warn("Microphone not available, proceeding without voice:", micErr);
        }
      }

      if (audioTracks.length > 0) {
        tracks.push(...audioTracks);
      }

      const combined = new MediaStream(tracks);
      combinedStreamRef.current = combined;

      const firstTabTrack = tabStream.getVideoTracks()[0];
      if (firstTabTrack) {
        firstTabTrack.onended = () => {
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

      const mediaRecorder = new MediaRecorder(combined, { mimeType: selectedMime });
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
        stopAllTracks();
      };

      mediaRecorder.start(1000);
      setRecorderState("recording");
      setElapsedSeconds(0);

      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      stopAllTracks();
      const error = err as Error;
      if (error?.name === "NotAllowedError") {
        setErrorMessage("Tab capture permission was cancelled or denied.");
      } else {
        setErrorMessage(error?.message || "Failed to start tab recording.");
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
      {/* Privacy Notice */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Web Tab Recorder — Record any browser tab with crystal-clear audio and zero uploads.</span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl flex items-start gap-3 text-xs text-rose-800 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Tab Recording Permission</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Console Box */}
      <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-center space-y-6">
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
            <Chrome className="w-10 h-10" />
          </div>

          <div>
            <div className="font-mono text-3xl font-bold text-slate-900 dark:text-white tracking-wider">
              {formatRecordingTime(elapsedSeconds)}
            </div>
            <p className="text-xs text-slate-500 mt-1 capitalize">
              Status: {recorderState === "idle" ? "Ready to Record Tab" : recorderState}
            </p>
          </div>
        </div>

        {/* Options & Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {recorderState === "idle" && (
            <>
              <button
                type="button"
                onClick={() => setTabAudioEnabled(!tabAudioEnabled)}
                className={`px-3 py-2 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-colors ${
                  tabAudioEnabled
                    ? "border-blue-300 bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300"
                    : "border-slate-300 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {tabAudioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                {tabAudioEnabled ? "Tab Audio On" : "Tab Audio Off"}
              </button>

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
                {micEnabled ? "Mic Narration On" : "Mic Narration Off"}
              </button>

              <Button
                size="lg"
                onClick={startRecording}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-medium px-6"
              >
                <Play className="w-4 h-4 fill-white" /> Choose Tab & Record
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
                <RotateCcw className="w-3.5 h-3.5" /> Record Another Tab
              </Button>

              {recordedBlobUrl && (
                <a
                  href={recordedBlobUrl}
                  download={`tab-recording-${Date.now()}.webm`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
                >
                  <Download className="w-4 h-4" /> Download WebM ({formatFileSize(recordedBlobSize)})
                </a>
              )}
            </>
          )}
        </div>
      </div>

      {/* Video Preview */}
      {recordedBlobUrl && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Video className="w-4 h-4 text-blue-600" /> Tab Recording Playback
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
