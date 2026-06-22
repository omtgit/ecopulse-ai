export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">⚙️ Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-bold">Profile</h2>
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-2xl font-bold text-white">
            E
          </div>
          <div>
            <p className="font-semibold">EcoPulse User</p>
            <p className="text-sm text-muted-foreground">Level 3 Eco Warrior • 450 pts</p>
          </div>
        </div>
        {[
          { label: "Name", value: "EcoPulse User", type: "text" },
          { label: "Email", value: "user@ecopulse.ai", type: "email" },
        ].map((f) => (
          <div key={f.label}>
            <label className="block text-sm font-medium text-muted-foreground mb-1">{f.label}</label>
            <input
              type={f.type}
              defaultValue={f.value}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/30 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
        ))}
        <button className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-all">
          Save Changes
        </button>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-bold">Notifications</h2>
        {[
          { label: "Daily habit reminders", sub: "Get reminded to log your habits", on: true },
          { label: "Challenge updates", sub: "Notifications about your active challenges", on: true },
          { label: "Weekly report email", sub: "Receive your progress report every Monday", on: false },
          { label: "Leaderboard alerts", sub: "Get notified when you move up the rankings", on: false },
        ].map((n) => (
          <div key={n.label} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{n.label}</p>
              <p className="text-xs text-muted-foreground">{n.sub}</p>
            </div>
            <div className={`w-10 h-6 rounded-full transition-colors ${n.on ? "bg-emerald-500" : "bg-muted"} cursor-pointer`}>
              <div className={`h-5 w-5 rounded-full bg-white m-0.5 shadow transition-transform ${n.on ? "translate-x-4" : ""}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 space-y-3">
        <h2 className="text-lg font-bold text-red-400">Danger Zone</h2>
        <p className="text-sm text-muted-foreground">These actions are permanent and cannot be undone.</p>
        <button className="px-5 py-2.5 border border-red-500/40 text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-semibold transition-all">
          Delete Account
        </button>
      </div>
    </div>
  );
}
