"use client";
import { useState } from "react";

const initialHabits = [
  { id: 1, emoji: "🚶", title: "Walk or Cycle to Work", points: 10, streak: 4, completed: false },
  { id: 2, emoji: "🥗", title: "Eat a Plant-Based Meal", points: 5, streak: 7, completed: false },
  { id: 3, emoji: "💡", title: "Turn Off Unused Lights", points: 3, streak: 2, completed: false },
  { id: 4, emoji: "♻️", title: "Recycle Waste Properly", points: 5, streak: 10, completed: false },
  { id: 5, emoji: "🚿", title: "Take a Short Shower (<5 min)", points: 5, streak: 0, completed: false },
  { id: 6, emoji: "🛍️", title: "Use Reusable Bags", points: 3, streak: 3, completed: false },
];

export default function HabitsPage() {
  const [habits, setHabits] = useState(initialHabits);

  function toggleHabit(id: number) {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? { ...h, completed: !h.completed, streak: !h.completed ? h.streak + 1 : Math.max(0, h.streak - 1) }
          : h
      )
    );
  }

  const earnedPoints = habits.filter((h) => h.completed).reduce((s, h) => s + h.points, 0);
  const totalPoints = habits.reduce((s, h) => s + h.points, 0);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">✅ Habit Tracker</h1>
          <p className="text-muted-foreground mt-1">Click &quot;Log&quot; to check off today&apos;s eco-habits</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Today&apos;s Points</p>
          <p className="text-2xl font-bold text-emerald-400">{earnedPoints} / {totalPoints}</p>
          <p className="text-xs text-muted-foreground">{habits.filter((h) => h.completed).length}/{habits.length} done</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
          style={{ width: `${(habits.filter((h) => h.completed).length / habits.length) * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {habits.map((habit) => (
          <div
            key={habit.id}
            className={`rounded-2xl border p-5 flex items-center gap-4 transition-all ${
              habit.completed
                ? "border-emerald-500/40 bg-emerald-500/10"
                : "border-border bg-card hover:border-emerald-500/20"
            }`}
          >
            <div className="text-3xl">{habit.emoji}</div>
            <div className="flex-1">
              <p className={`font-semibold ${habit.completed ? "line-through text-muted-foreground" : ""}`}>
                {habit.title}
              </p>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span>+{habit.points} pts</span>
                {habit.streak > 0 && <span>🔥 {habit.streak} day streak</span>}
              </div>
            </div>
            <button
              onClick={() => toggleHabit(habit.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                habit.completed
                  ? "bg-emerald-500/20 text-emerald-400 hover:bg-red-500/10 hover:text-red-400"
                  : "bg-emerald-500 hover:bg-emerald-600 text-white"
              }`}
            >
              {habit.completed ? "✓ Undo" : "Log"}
            </button>
          </div>
        ))}
      </div>

      {habits.every((h) => h.completed) && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6 text-center">
          <p className="text-2xl font-bold text-emerald-400">🎉 All habits logged for today!</p>
          <p className="text-muted-foreground mt-1">You earned {totalPoints} points. Amazing work!</p>
        </div>
      )}
    </div>
  );
}
