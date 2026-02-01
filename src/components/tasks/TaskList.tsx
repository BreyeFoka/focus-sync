"use client";

import { useStore } from "@/store/useStore";
import { TaskItem } from "./TaskItem";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";

export function TaskList() {
    const { tasks, addTask } = useStore();
    const [newTask, setNewTask] = useState("");

    const handleAdd = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newTask.trim()) return;
        addTask(newTask);
        setNewTask("");
    };

    return (
        <div className="flex flex-col h-full">
            <form onSubmit={handleAdd} className="flex gap-2 mb-4">
                <Input
                    placeholder="Add a new task..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    className="flex-1"
                />
                <Button type="submit" size="icon">
                    <Plus className="h-4 w-4" />
                </Button>
            </form>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[200px]">
                <AnimatePresence mode="popLayout">
                    {tasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm py-10">
                            <p>No tasks yet.</p>
                            <p>Add one to get started!</p>
                        </div>
                    ) : (
                        tasks.map((task) => (
                            <TaskItem key={task.id} task={task} />
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
