export default function ReportsPage() {
  const months = [
    { month: "January", footprint: 520, reduction: 0 },
    { month: "February", footprint: 495, reduction: -4.8 },
    { month: "March", footprint: 470, reduction: -5.0 },
    { month: "April", footprint: 450, reduction: -4.3 },
    { month: "May", footprint: 430, reduction: -4.4 },
    { month: "June", footprint: 412, reduction: -4.2 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">📄 Reports</h1>
          <p className="text-muted-foreground mt-1">Your sustainability progress over time</p>
        </div>
        <button className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-all">
          📥 Download PDF
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Reduction", value: "108 kg", sub: "Since January", color: "text-emerald-400" },
          { label: "Best Month", value: "June", sub: "412 kg CO₂", color: "text-teal-400" },
          { label: "Avg Monthly", value: "463 kg", sub: "Across 6 months", color: "text-cyan-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Monthly Breakdown */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold mb-4">Monthly Footprint</h2>
        <div className="space-y-4">
          {months.map((m) => {
            const pct = ((m.footprint / 520) * 100).toFixed(0);
            return (
              <div key={m.month} className="flex items-center gap-4">
                <span className="w-24 text-sm text-muted-foreground">{m.month}</span>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-20 text-sm font-medium text-right">{m.footprint} kg</span>
                {m.reduction !== 0 && (
                  <span className="text-xs text-emerald-400 w-14 text-right">{m.reduction}%</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold mb-4">June Category Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "🚗 Transport", value: "180 kg", pct: 44 },
            { label: "⚡ Electricity", value: "90 kg", pct: 22 },
            { label: "🥩 Food", value: "100 kg", pct: 24 },
            { label: "🛍️ Shopping", value: "42 kg", pct: 10 },
          ].map((c) => (
            <div key={c.label} className="text-center">
              <p className="text-sm mb-1">{c.label}</p>
              <p className="text-2xl font-bold text-emerald-400">{c.pct}%</p>
              <p className="text-xs text-muted-foreground">{c.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
