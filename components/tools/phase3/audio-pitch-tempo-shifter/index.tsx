"use client";

import React, { useState, useRef } from "react";
import {
  Music,
  Play,
  Pause,
  Download,
  RotateCcw,
  Sliders,
  Volume2,
  FastForward,
} from "lucide-react";
import { semitonesToPlaybackRate, encodeWav } from "./logic";

export default function AudioPitchTempoShifterTool() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [pitchSemitones, setPitchSemitones] = useState<number>(0);
  const [tempoRate, setTempoRate] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.playbackRate = tempoRate * semitonesToPlaybackRate(pitchSemitones);
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleReset = () => {
    setPitchSemitones(0);
    setTempoRate(1.0);
    if (audioRef.current) {
      audioRef.current.playbackRate = 1.0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm text-foreground">
              In-Browser Audio Pitch & Tempo Shifter
            </span>
            <span className="text-[11px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              Real-Time Playback Shifter
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-muted text-foreground text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Sliders
            </button>
          </div>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t border-border/50 text-xs">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Pitch Shift (Semitones)</span>
              <span className="font-mono text-foreground font-bold">
                {pitchSemitones > 0 ? `+${pitchSemitones}` : pitchSemitones} st
              </span>
            </div>
            <input
              type="range"
              min="-12"
              max="12"
              step="1"
              value={pitchSemitones}
              onChange={(e) => {
                const val = Number(e.target.value);
                setPitchSemitones(val);
                if (audioRef.current) {
                  audioRef.current.playbackRate = tempoRate * semitonesToPlaybackRate(val);
                }
              }}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Tempo / Speed Stretch</span>
              <span className="font-mono text-foreground font-bold">{tempoRate.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={tempoRate}
              onChange={(e) => {
                const val = Number(e.target.value);
                setTempoRate(val);
                if (audioRef.current) {
                  audioRef.current.playbackRate = val * semitonesToPlaybackRate(pitchSemitones);
                }
              }}
              className="w-full accent-primary cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      {!audioUrl ? (
        <div className="rounded-3xl border-2 border-dashed border-border/80 p-12 text-center bg-card/50 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-foreground">Upload Audio File</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Supports MP3, WAV, AAC, OGG. Alter pitch and playback tempo in device memory.
            </p>
          </div>
          <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 shadow-sm transition-opacity">
            <span>Select Audio Track</span>
            <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-6 shadow-sm">
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />

          <div className="flex items-center justify-center gap-3">
            <Music className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm text-foreground">{audioFile?.name}</span>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all mx-auto"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span>Pitch: {pitchSemitones} semitones</span>
            <span>·</span>
            <span>Speed: {(tempoRate * 100).toFixed(0)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
