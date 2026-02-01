import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Task = {
    id: string;
    text: string;
    completed: boolean;
    createdAt: number;
};

export type TimerMode = 'work' | 'shortBreak' | 'longBreak';

interface AppState {
    // Task State
    tasks: Task[];
    addTask: (text: string) => void;
    toggleTask: (id: string) => void;
    deleteTask: (id: string) => void;

    // Timer State
    timerMode: TimerMode;
    timerDuration: number; // in seconds
    timeLeft: number;
    isActive: boolean;
    setTimerMode: (mode: TimerMode) => void;
    setTimeLeft: (time: number) => void;
    setIsActive: (active: boolean) => void;
    resetTimer: () => void;

    // Settings
    soundVolume: number;
    setSoundVolume: (volume: number) => void;
}

const TIMER_DURATIONS = {
    work: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
};

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Tasks
            tasks: [],
            addTask: (text) =>
                set((state) => ({
                    tasks: [
                        ...state.tasks,
                        { id: crypto.randomUUID(), text, completed: false, createdAt: Date.now() },
                    ],
                })),
            toggleTask: (id) =>
                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === id ? { ...t, completed: !t.completed } : t
                    ),
                })),
            deleteTask: (id) =>
                set((state) => ({
                    tasks: state.tasks.filter((t) => t.id !== id),
                })),

            // Timer
            timerMode: 'work',
            timerDuration: TIMER_DURATIONS.work,
            timeLeft: TIMER_DURATIONS.work,
            isActive: false,
            setTimerMode: (mode) => {
                const duration = TIMER_DURATIONS[mode];
                set({ timerMode: mode, timerDuration: duration, timeLeft: duration, isActive: false });
            },
            setTimeLeft: (time) => set({ timeLeft: time }),
            setIsActive: (active) => set({ isActive: active }),
            resetTimer: () => {
                const { timerMode } = get();
                const duration = TIMER_DURATIONS[timerMode];
                set({ timeLeft: duration, isActive: false });
            },

            // Settings
            soundVolume: 0.5,
            setSoundVolume: (volume) => set({ soundVolume: volume }),
        }),
        {
            name: 'focussync-storage',
            storage: createJSONStorage(() => localStorage),
            // Only persist tasks and settings, possibly not active timer state if we want strict reset on reload,
            // but persisting everything is fine for now.
        }
    )
);
