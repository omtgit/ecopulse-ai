export default function LeaderboardPage() {
  const leaders = [
    { rank: 1, name: "Sophia Green", avatar: "🧑‍🌿", points: 2840, footprint: 180, badge: "🌟 Eco Legend" },
    { rank: 2, name: "Liam Rivers", avatar: "🧑", points: 2450, footprint: 210, badge: "🌿 Green Hero" },
    { rank: 3, name: "Emma Forest", avatar: "👩", points: 2210, footprint: 240, badge: "🌱 Eco Warrior" },
    { rank: 4, name: "Noah Waters", avatar: "🧑", points: 1980, footprint: 290, badge: "♻️ Recycler Pro" },
    { rank: 5, name: "Ava Bloom", avatar: "👩", points: 1750, footprint: 310, badge: "🌍 Planet Saver" },
    { rank: 6, name: "You", avatar: "⭐", points: 450, footprint: 412, badge: "🔥 Eco Starter", isUser: true },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🏅 Leaderboard</h1>
        <p className="text-muted-foreground mt-1">Top eco-warriors this month</p>
      </div>

      {/* Podium */}
      <div className="grid grid-cols-3 gap-4 max-w-2xl">
        {([leaders[1]!, leaders[0]!, leaders[2]!]).map((l, i) => (
          <div
            key={l.name}
            className={`rounded-2xl border p-5 text-center ${
              i === 1
                ? "border-yellow-500/40 bg-yellow-500/10 scale-105"
                : "border-border bg-card"
            }`}
          >
            <div className="text-3xl mb-2">{i === 1 ? "🥇" : i === 0 ? "🥈" : "🥉"}</div>
            <div className="text-2xl mb-2">{l.avatar}</div>
            <p className="font-bold text-sm">{l.name}</p>
            <p className="text-emerald-400 font-bold">{l.points} pts</p>
          </div>
        ))}
      </div>

      {/* Full list */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-[40px_1fr_auto_auto] gap-4 px-6 py-3 border-b border-border bg-muted/30 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <span>#</span>
          <span>User</span>
          <span>Footprint</span>
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
                {l.avatar} {l.name} {l.isUser && <span className="text-xs text-emerald-400">(You)</span>}
              </p>
              <p className="text-xs text-muted-foreground">{l.badge}</p>
            </div>
            <span className="text-sm text-muted-foreground">{l.footprint} kg</span>
            <span className="font-bold text-emerald-400">{l.points}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
