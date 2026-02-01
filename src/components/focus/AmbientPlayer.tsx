"use client";

import { useState, useEffect, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { CloudRain, Waves, Wind, Volume2, LucideIcon, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";

type SoundType = 'white' | 'pink' | 'brown' | 'lofi';

const SOUNDS: { id: SoundType; label: string; icon: LucideIcon }[] = [
    { id: 'white', label: 'Focus (White)', icon: Wind },
    { id: 'pink', label: 'Rain (Pink)', icon: CloudRain },
    { id: 'brown', label: 'Deep (Brown)', icon: Waves },
    { id: 'lofi', label: 'Lofi Radio', icon: Radio },
];

const LOFI_STREAM_URL = "https://stream.zeno.fm/0r0xa792kwzuv";

const createNoiseBuffer = (ctx: AudioContext, type: SoundType) => {
    const bufferSize = ctx.sampleRate * 2; // 2 seconds buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;

        if (type === 'white') {
            output[i] = white;
        } else if (type === 'pink') {
            const b = [0, 0, 0, 0, 0, 0, 0]; // Pink noise storage
            // Pink noise approximation (Paul Kellett's refined method)
            b[0] = 0.99886 * b[0] + white * 0.0555179;
            b[1] = 0.99332 * b[1] + white * 0.0750759;
            b[2] = 0.96900 * b[2] + white * 0.1538520;
            b[3] = 0.86650 * b[3] + white * 0.3104856;
            b[4] = 0.55000 * b[4] + white * 0.5329522;
            b[5] = -0.7616 * b[5] - white * 0.0168980;
            output[i] = b[0] + b[1] + b[2] + b[3] + b[4] + b[5] + b[6] + white * 0.5362;
            output[i] *= 0.11; // Compensate for gain
            b[6] = white * 0.115926;
        } else if (type === 'brown') {
            const lastOut = (i > 0) ? output[i - 1] : 0;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            output[i] *= 3.5; // Gain compensation
        }
    }
    return buffer;
};

// Extend Window interface for webkitAudioContext
declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext;
    }
}

export function AmbientPlayer() {
    const { soundVolume, setSoundVolume } = useStore();
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeSound, setActiveSound] = useState<SoundType>('pink');

    // Web Audio API refs (for Noise)
    const audioContextRef = useRef<AudioContext | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

    // HTML Audio ref (for Lofi)
    const audioElRef = useRef<HTMLAudioElement | null>(null);

    // Stop function needs to be stable or accessible
    const stopSound = () => {
        // Stop Web Audio (Noise)
        if (sourceNodeRef.current) {
            try {
                sourceNodeRef.current.stop();
                sourceNodeRef.current.disconnect();
            } catch {
                // Ignore if already stopped
            }
            sourceNodeRef.current = null;
        }

        // Stop HTML Audio (Lofi)
        if (audioElRef.current) {
            audioElRef.current.pause();
            audioElRef.current.src = ""; // Clear source
            audioElRef.current = null;
        }

        setIsPlaying(false);
    };

    // Initialize Audio Context Cleanup
    useEffect(() => {
        return () => {
            // Cleanup on unmount
            if (sourceNodeRef.current) {
                try {
                    sourceNodeRef.current.stop();
                    sourceNodeRef.current.disconnect();
                } catch {
                    // Ignore
                }
            }
            if (audioContextRef.current) {
                try {
                    audioContextRef.current.close();
                } catch {
                    // Ignore
                }
            }
            if (audioElRef.current) {
                audioElRef.current.pause();
                audioElRef.current = null;
            }
        };
    }, []);

    // Handle Volume Changes
    useEffect(() => {
        // Web Audio Volume
        if (gainNodeRef.current && audioContextRef.current) {
            gainNodeRef.current.gain.setValueAtTime(soundVolume, audioContextRef.current.currentTime);
        }
        // HTML Audio Volume
        if (audioElRef.current) {
            audioElRef.current.volume = soundVolume;
        }
    }, [soundVolume]);

    const playSound = (type: SoundType) => {
        // 1. Stop any current sound
        stopSound();
        setIsPlaying(true); // Re-set to true as stopSound sets it false
        setActiveSound(type);

        if (type === 'lofi') {
            // Play Lofi Stream
            const audio = new Audio(LOFI_STREAM_URL);
            audio.volume = soundVolume;
            audio.loop = true;
            // Play with user interaction handling
            audio.play().catch(e => {
                console.error("Audio playback error:", e);
                setIsPlaying(false);
            });
            audioElRef.current = audio;
        } else {
            // Play Noise (Web Audio)
            if (!audioContextRef.current) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                audioContextRef.current = new AudioCtx();
            }

            const ctx = audioContextRef.current!;

            const buffer = createNoiseBuffer(ctx, type);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.loop = true;

            // Create Gain Node (Volume) if needed
            if (!gainNodeRef.current) {
                const gainNode = ctx.createGain();
                gainNode.connect(ctx.destination);
                gainNodeRef.current = gainNode;
            }

            source.connect(gainNodeRef.current!);

            // Set Volume
            gainNodeRef.current!.gain.setValueAtTime(soundVolume, ctx.currentTime);

            source.start();
            sourceNodeRef.current = source;
        }
    };

    const toggleSound = () => {
        if (isPlaying) {
            stopSound();
        } else {
            playSound(activeSound);
        }
    };

    const switchSound = (type: SoundType) => {
        if (isPlaying && activeSound === type) return;
        if (isPlaying) {
            // Switch immediately
            playSound(type);
        } else {
            // Just select, wait for manual play
            setActiveSound(type);
        }
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                    <Volume2 className="w-4 h-4" /> Ambient Sound
                </h3>
                <Button
                    variant={isPlaying ? "default" : "outline"}
                    size="sm"
                    onClick={toggleSound}
                    className={cn("w-24 transition-all", isPlaying && "animate-pulse")}
                >
                    {isPlaying ? "Stop" : "Play"}
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
                {SOUNDS.map((sound) => (
                    <button
                        key={sound.id}
                        onClick={() => switchSound(sound.id)}
                        className={cn(
                            "flex items-center justify-start px-4 py-3 rounded-lg border text-sm gap-3 transition-all",
                            activeSound === sound.id
                                ? "bg-primary/10 border-primary text-primary font-medium shadow-sm"
                                : "bg-card hover:bg-secondary/60 text-muted-foreground border-transparent hover:border-border"
                        )}
                    >
                        <sound.icon className="w-5 h-5 shrink-0" />
                        {sound.label}
                    </button>
                ))}
            </div>

            <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Volume</span>
                    <span>{Math.round(soundVolume * 100)}%</span>
                </div>
                <Slider
                    value={[soundVolume]}
                    max={1}
                    step={0.01}
                    onValueChange={(val) => setSoundVolume(val[0])}
                    className="w-full"
                />
            </div>
        </div>
    );
}
