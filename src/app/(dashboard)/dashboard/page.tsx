export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back 🌱</h1>
        <p className="text-muted-foreground mt-1">Here&apos;s your sustainability overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Monthly Footprint", value: "412 kg", sub: "↓ 12% from last month", color: "text-emerald-400" },
          { label: "Current Streak", value: "5 days", sub: "Keep logging habits!", color: "text-teal-400" },
          { label: "Total Points", value: "450 pts", sub: "Level 3 Eco Warrior", color: "text-cyan-400" },
          { label: "Active Challenges", value: "2", sub: "Meatless Monday active", color: "text-blue-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-2">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Coach */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-bold mb-4">🤖 AI Sustainability Coach</h2>
          <div className="space-y-4">
            {[
              { title: "💡 Active Commute", body: "Replace 2 car rides/week with cycling → save 18 kg CO₂/month." },
              { title: "💡 Energy Efficiency", body: "Switch to LED bulbs → reduce electricity emissions by 15%." },
              { title: "💡 Plant-Based Meals", body: "One meatless day per week reduces your food footprint by ~8%." },
            ].map((tip) => (
              <div key={tip.title} className="p-4 rounded-xl bg-muted/50 border border-border">
                <p className="text-sm font-semibold mb-1">{tip.title}</p>
                <p className="text-sm text-muted-foreground">{tip.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-3">
          <h2 className="text-xl font-bold mb-2">Quick Actions</h2>
          {[
            { href: "/calculator", label: "🧮 Calculate Footprint" },
            { href: "/habits", label: "✅ Log Daily Habits" },
            { href: "/challenges", label: "🏆 Join a Challenge" },
            { href: "/leaderboard", label: "🏅 View Leaderboard" },
            { href: "/reports", label: "📄 Download Report" },
            { href: "/settings", label: "⚙️ Settings" },
          ].map((a) => (
            <a
              key={a.href}
              href={a.href}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border hover:bg-muted/50 hover:border-emerald-500/40 text-sm font-medium transition-all"
            >
              {a.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
