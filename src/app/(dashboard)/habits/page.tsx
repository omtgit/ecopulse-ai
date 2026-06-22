export default function HabitsPage() {
  const habits = [
    { id: 1, emoji: "🚶", title: "Walk or Cycle to Work", points: 10, streak: 4, completed: true },
    { id: 2, emoji: "🥗", title: "Eat a Plant-Based Meal", points: 5, streak: 7, completed: true },
    { id: 3, emoji: "💡", title: "Turn Off Unused Lights", points: 3, streak: 2, completed: false },
    { id: 4, emoji: "♻️", title: "Recycle Waste Properly", points: 5, streak: 10, completed: false },
    { id: 5, emoji: "🚿", title: "Take a Short Shower (<5 min)", points: 5, streak: 0, completed: false },
    { id: 6, emoji: "🛍️", title: "Use Reusable Bags", points: 3, streak: 3, completed: true },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">✅ Habit Tracker</h1>
          <p className="text-muted-foreground mt-1">Log your daily eco-friendly habits</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Today&apos;s Points</p>
          <p className="text-2xl font-bold text-emerald-400">18 / 31</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {habits.map((habit) => (
          <div
            key={habit.id}
            className={`rounded-2xl border p-5 flex items-center gap-4 transition-all ${
              habit.completed
                ? "border-emerald-500/40 bg-emerald-500/10"
                : "border-border bg-card hover:border-emerald-500/30"
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
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                habit.completed
                  ? "bg-emerald-500/20 text-emerald-400 cursor-default"
                  : "bg-emerald-500 hover:bg-emerald-600 text-white"
              }`}
            >
              {habit.completed ? "✓ Done" : "Log"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
