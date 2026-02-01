"use client";

import { useStore, TimerMode } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Coffee, Zap, Brain, LucideIcon } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const MODES: { id: TimerMode; label: string; icon: LucideIcon }[] = [
    { id: 'work', label: 'Work', icon: Zap },
    { id: 'shortBreak', label: 'Short Break', icon: Coffee },
    { id: 'longBreak', label: 'Long Break', icon: Brain },
];

export function FocusTimer() {
    const {
        timeLeft,
        isActive,
        timerMode,
        timerDuration,
        setTimeLeft,
        setIsActive,
        resetTimer,
        setTimerMode
    } = useStore();

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Optional: Play alarm sound here
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeLeft, setTimeLeft, setIsActive]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = ((timerDuration - timeLeft) / timerDuration) * 100;

    return (
        <div className="flex flex-col items-center gap-6 w-full">
            {/* Mode Selectors */}
            <div className="flex bg-secondary/50 p-1 rounded-lg gap-1">
                {MODES.map((mode) => (
                    <button
                        key={mode.id}
                        onClick={() => setTimerMode(mode.id)}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2",
                            timerMode === mode.id
                                ? "bg-background shadow-sm text-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                        )}
                    >
                        <mode.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{mode.label}</span>
                    </button>
                ))}
            </div>

            {/* Timer Display */}
            <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Simple Ring using SVG */}
                <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-muted"
                    />
                    <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="text-primary"
                        strokeDasharray="283"
                        strokeDashoffset={283 - (283 * progress) / 100} // Inverse progress for countdown feel
                        initial={{ strokeDashoffset: 0 }}
                        animate={{ strokeDashoffset: (283 * progress) / 100 }}
                        transition={{ duration: 0.5, ease: "linear" }}
                    />
                </svg>

                <div className="z-10 text-center">
                    <div className="text-6xl font-bold tracking-tighter tabular-nums text-foreground">
                        {formatTime(timeLeft)}
                    </div>
                    <div className="text-muted-foreground mt-2 capitalize font-medium">
                        {isActive ? 'Focusing...' : 'Ready'}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
                <Button
                    size="lg"
                    variant={isActive ? "secondary" : "default"}
                    className="h-14 px-8 text-lg rounded-full"
                    onClick={() => setIsActive(!isActive)}
                >
                    {isActive ? (
                        <>
                            <Pause className="mr-2 h-5 w-5" /> Pause
                        </>
                    ) : (
                        <>
                            <Play className="ml-2 mr-1 h-5 w-5" fill="currentColor" /> Start
                        </>
                    )}
                </Button>

                <Button
                    size="icon"
                    variant="ghost"
                    className="h-14 w-14 rounded-full border border-border"
                    onClick={resetTimer}
                    aria-label="Reset Timer"
                >
                    <RotateCcw className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}
