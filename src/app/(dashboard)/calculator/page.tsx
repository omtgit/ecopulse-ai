export default function CalculatorPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🧮 Carbon Calculator</h1>
        <p className="text-muted-foreground mt-1">Calculate your carbon footprint from daily activities</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          {
            category: "🚗 Transport",
            color: "emerald",
            fields: [
              { label: "Car travel (km/week)", placeholder: "e.g. 100", factor: "0.21 kg CO₂/km" },
              { label: "Flights (hours/year)", placeholder: "e.g. 10", factor: "0.25 kg CO₂/km" },
            ],
          },
          {
            category: "⚡ Electricity",
            color: "yellow",
            fields: [
              { label: "Monthly electricity (kWh)", placeholder: "e.g. 300", factor: "0.45 kg CO₂/kWh" },
            ],
          },
          {
            category: "🥩 Food",
            color: "orange",
            fields: [
              { label: "Meat meals per week", placeholder: "e.g. 7", factor: "~2.5 kg CO₂/meal" },
              { label: "Veg meals per week", placeholder: "e.g. 7", factor: "~0.5 kg CO₂/meal" },
            ],
          },
          {
            category: "🛍️ Shopping",
            color: "purple",
            fields: [
              { label: "Monthly spend on goods (£)", placeholder: "e.g. 200", factor: "~0.5 kg CO₂/£" },
            ],
          },
        ].map((section) => (
          <div key={section.category} className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-bold mb-4">{section.category}</h2>
            <div className="space-y-4">
              {section.fields.map((field) => (
                <div key={field.label}>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    {field.label}
                  </label>
                  <input
                    type="number"
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/30 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Factor: {field.factor}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Estimated Monthly Footprint</p>
          <p className="text-4xl font-bold text-emerald-400">--- kg CO₂</p>
          <p className="text-xs text-muted-foreground mt-1">Fill in the fields above and click Calculate</p>
        </div>
        <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-all">
          Calculate →
        </button>
      </div>
    </div>
  );
}
