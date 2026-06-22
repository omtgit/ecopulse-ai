"use client";

const months = [
  { month: "January", footprint: 520, reduction: 0 },
  { month: "February", footprint: 495, reduction: -4.8 },
  { month: "March", footprint: 470, reduction: -5.0 },
  { month: "April", footprint: 450, reduction: -4.3 },
  { month: "May", footprint: 430, reduction: -4.4 },
  { month: "June", footprint: 412, reduction: -4.2 },
];

export default function ReportsPage() {
  function downloadReport() {
    const lines = [
      "EcoPulse AI — Sustainability Report",
      "Generated: " + new Date().toLocaleDateString("en-GB"),
      "",
      "=== Monthly Footprint Summary ===",
      ...months.map((m) => `${m.month.padEnd(12)} ${m.footprint} kg CO₂${m.reduction !== 0 ? "  (" + m.reduction + "%)" : ""}`),
      "",
      "=== June Category Breakdown ===",
      "Transport   : 180 kg  (44%)",
      "Electricity :  90 kg  (22%)",
      "Food        : 100 kg  (24%)",
      "Shopping    :  42 kg  (10%)",
      "",
      "=== Summary ===",
      "Total reduction Jan-Jun : 108 kg CO₂",
      "Best month              : June (412 kg)",
      "Average monthly         : 463 kg",
      "",
      "Keep up the great work! 🌱",
      "— EcoPulse AI Team",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ecopulse-report-june-2026.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">📄 Reports</h1>
          <p className="text-muted-foreground mt-1">Your sustainability progress over time</p>
        </div>
        <button
          onClick={downloadReport}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
        >
          📥 Download Report (.txt)
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Reduction", value: "108 kg", sub: "Since January 2026", color: "text-emerald-400" },
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

      {/* Monthly chart */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold mb-5">Monthly Footprint (2026)</h2>
        <div className="space-y-4">
          {months.map((m) => {
            const pct = ((m.footprint / 520) * 100).toFixed(0);
            return (
              <div key={m.month} className="flex items-center gap-4">
                <span className="w-24 text-sm text-muted-foreground shrink-0">{m.month}</span>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-20 text-sm font-medium text-right shrink-0">{m.footprint} kg</span>
                {m.reduction !== 0 && (
                  <span className="text-xs text-emerald-400 w-12 text-right shrink-0">{m.reduction}%</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Category breakdown */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold mb-5">June Category Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "🚗 Transport", value: "180 kg", pct: 44, color: "from-blue-500 to-blue-600" },
            { label: "⚡ Electricity", value: "90 kg", pct: 22, color: "from-yellow-500 to-yellow-600" },
            { label: "🥩 Food", value: "100 kg", pct: 24, color: "from-orange-500 to-orange-600" },
            { label: "🛍️ Shopping", value: "42 kg", pct: 10, color: "from-purple-500 to-purple-600" },
          ].map((c) => (
            <div key={c.label} className="text-center">
              <p className="text-sm mb-2">{c.label}</p>
              <div className="relative w-20 h-20 mx-auto mb-2">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none" strokeWidth="3"
                    stroke="url(#g)" strokeDasharray={`${c.pct} 100`}
                    strokeLinecap="round" className="text-emerald-500"
                    style={{ stroke: c.pct > 30 ? "#f97316" : "#10b981" }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{c.pct}%</span>
              </div>
              <p className="text-xs text-muted-foreground">{c.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
