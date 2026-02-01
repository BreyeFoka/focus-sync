"use client";

import { FocusTimer } from "@/components/focus/FocusTimer";
import { TaskList } from "@/components/tasks/TaskList";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 md:p-8 font-sans transition-colors duration-500">
      <main className="max-w-5xl w-full flex flex-col gap-12">

        {/* Header */}
        <header className="flex flex-col items-center gap-4 text-center animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
            FocusSync
          </h1>
          <p className="text-lg text-muted-foreground max-w-[500px]">
            Master your workflow with focused intervals and organized tasks.
          </p>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Timer */}
          <section className="lg:col-span-7 flex flex-col items-center animate-in fade-in slide-in-from-left-4 duration-700 delay-150">
            <div className="w-full bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 shadow-sm">
              <FocusTimer />
            </div>

            <div className="mt-8 text-sm text-muted-foreground/60">
              <p>Tip: Deep work happens in distraction-free zones.</p>
            </div>
          </section>

          {/* Right Column: Tasks */}
          <section className="lg:col-span-5 h-full animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
            <div className="w-full h-full min-h-[500px] bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Tasks</h2>
                <span className="text-xs text-muted-foreground px-2 py-1 bg-secondary rounded-full">
                  Auto-saved
                </span>
              </div>
              <TaskList />
            </div>
          </section>
        </div>

      </main>
    </div>
  );
}
