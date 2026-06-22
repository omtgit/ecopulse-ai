"use client";
import { useState } from "react";

type Status = "join" | "active" | "completed";

const initialChallenges = [
  { id: 1, emoji: "🚫🚗", title: "No Car Day", desc: "Go an entire day without using a car. Walk, bike, or take public transit.", points: 50, difficulty: "Easy", days: 1, status: "join" as Status },
  { id: 2, emoji: "🥬", title: "Meatless Monday", desc: "Eat only plant-based meals every Monday for a month.", points: 30, difficulty: "Easy", days: 4, status: "join" as Status },
  { id: 3, emoji: "⚡", title: "Energy Saver Week", desc: "Reduce your electricity usage by 20% for a full week.", points: 100, difficulty: "Medium", days: 7, status: "join" as Status },
  { id: 4, emoji: "♻️", title: "Zero Waste Day", desc: "Produce zero landfill waste for one full day.", points: 40, difficulty: "Medium", days: 1, status: "join" as Status },
  { id: 5, emoji: "🌳", title: "Plant a Tree", desc: "Plant a tree or donate to a tree-planting initiative.", points: 200, difficulty: "Easy", days: 1, status: "join" as Status },
  { id: 6, emoji: "🚿", title: "5-Minute Shower Challenge", desc: "Keep all showers under 5 minutes for 2 weeks.", points: 75, difficulty: "Hard", days: 14, status: "join" as Status },
];

const diffColor: Record<string, string> = {
  Easy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  Medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  Hard: "text-red-400 bg-red-500/10 border-red-500/30",
};

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState(initialChallenges);

  function cycleStatus(id: number) {
    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        if (c.status === "join") return { ...c, status: "active" as Status };
        if (c.status === "active") return { ...c, status: "completed" as Status };
        return { ...c, status: "join" as Status };
      })
    );
  }

  const activeCount = challenges.filter((c) => c.status === "active").length;
  const completedCount = challenges.filter((c) => c.status === "completed").length;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">🏆 Eco Challenges</h1>
          <p className="text-muted-foreground mt-1">Join challenges, earn points and badges</p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-2 text-center">
            <p className="text-xl font-bold text-teal-400">{activeCount}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-center">
            <p className="text-xl font-bold text-emerald-400">{completedCount}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {challenges.map((c) => (
          <div key={c.id} className={`rounded-2xl border p-6 flex flex-col gap-4 transition-all ${c.status === "active" ? "border-teal-500/40 bg-teal-500/5" : c.status === "completed" ? "border-emerald-500/40 bg-emerald-500/5" : "border-border bg-card"}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{c.emoji}</div>
                <div>
                  <p className="font-bold">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.days} day{c.days > 1 ? "s" : ""} · +{c.points} pts</p>
                </div>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${diffColor[c.difficulty]}`}>
                {c.difficulty}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{c.desc}</p>
            <button
              onClick={() => cycleStatus(c.id)}
              className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
                c.status === "active"
                  ? "bg-teal-500/20 text-teal-400 border border-teal-500/30 hover:bg-teal-500/30"
                  : c.status === "completed"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-muted"
                  : "bg-emerald-500 hover:bg-emerald-600 text-white"
              }`}
            >
              {c.status === "active" ? "🔥 In Progress — Mark Complete" : c.status === "completed" ? "✓ Completed — Reset" : "Join Challenge"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
