export default function LeaderboardPage() {
  const leaders = [
    { rank: 1, name: "Priya Sharma", country: "🇮🇳", points: 1840, footprint: 195, badge: "🌟 Eco Legend" },
    { rank: 2, name: "Lucas Müller", country: "🇩🇪", points: 1530, footprint: 220, badge: "🌿 Green Hero" },
    { rank: 3, name: "Amara Osei", country: "🇬🇭", points: 1280, footprint: 255, badge: "🌱 Eco Warrior" },
    { rank: 4, name: "You", country: "⭐", points: 450, footprint: 412, badge: "🔥 Rising Star", isUser: true },
    { rank: 5, name: "James Carter", country: "🇬🇧", points: 310, footprint: 480, badge: "♻️ Getting Started" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🏅 Leaderboard</h1>
        <p className="text-muted-foreground mt-1">Top eco-warriors this month · sorted by points earned</p>
      </div>

      {/* Podium */}
      <div className="grid grid-cols-3 gap-4 max-w-lg">
        {([leaders[1], leaders[0], leaders[2]] as typeof leaders).map((l, i) => (
          <div
            key={l.rank}
            className={`rounded-2xl border p-4 text-center ${
              i === 1
                ? "border-yellow-500/40 bg-yellow-500/10 scale-105"
                : "border-border bg-card"
            }`}
          >
            <div className="text-3xl mb-1">{i === 1 ? "🥇" : i === 0 ? "🥈" : "🥉"}</div>
            <div className="text-xl mb-1">{l.country}</div>
            <p className="font-bold text-sm">{l.name}</p>
            <p className="text-emerald-400 font-bold text-sm">{l.points} pts</p>
          </div>
        ))}
      </div>

      {/* Full list */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-[40px_1fr_auto_auto] gap-4 px-6 py-3 border-b border-border bg-muted/30 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <span>#</span>
          <span>User</span>
          <span className="hidden sm:block">Footprint</span>
          <span>Points</span>
        </div>
        {leaders.map((l) => (
          <div
            key={l.rank}
            className={`grid grid-cols-[40px_1fr_auto_auto] gap-4 px-6 py-4 border-b border-border last:border-0 items-center ${
              l.isUser ? "bg-emerald-500/10" : "hover:bg-muted/30"
            } transition-colors`}
          >
            <span className="font-bold text-muted-foreground">#{l.rank}</span>
            <div>
              <p className="font-semibold flex items-center gap-2">
                {l.country} {l.name}
                {l.isUser && <span className="text-xs text-emerald-400 font-normal">(You)</span>}
              </p>
              <p className="text-xs text-muted-foreground">{l.badge}</p>
            </div>
            <span className="text-sm text-muted-foreground hidden sm:block">{l.footprint} kg/mo</span>
            <span className="font-bold text-emerald-400">{l.points}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Rankings update daily · Earn points by logging habits and completing challenges
      </p>
    </div>
  );
}
