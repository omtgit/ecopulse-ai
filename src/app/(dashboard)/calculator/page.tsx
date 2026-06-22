"use client";
import { useState } from "react";

export default function CalculatorPage() {
  const [values, setValues] = useState({
    carKm: "",
    flightHours: "",
    electricityKwh: "",
    meatMeals: "",
    vegMeals: "",
    shopping: "",
  });
  const [result, setResult] = useState<null | { total: number; breakdown: Record<string, number> }>(null);

  function handleChange(key: string, val: string) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  function calculate() {
    const car = (parseFloat(values.carKm) || 0) * 0.21 * 4.33;
    const flight = (parseFloat(values.flightHours) || 0) * 90 * (0.255 / 12);
    const electricity = (parseFloat(values.electricityKwh) || 0) * 0.45;
    const meat = (parseFloat(values.meatMeals) || 0) * 2.5 * 4.33;
    const veg = (parseFloat(values.vegMeals) || 0) * 0.5 * 4.33;
    const shop = (parseFloat(values.shopping) || 0) * 0.5;
    const total = car + flight + electricity + meat + veg + shop;
    setResult({
      total: Math.round(total * 10) / 10,
      breakdown: {
        "🚗 Transport": Math.round((car + flight) * 10) / 10,
        "⚡ Electricity": Math.round(electricity * 10) / 10,
        "🥩 Food": Math.round((meat + veg) * 10) / 10,
        "🛍️ Shopping": Math.round(shop * 10) / 10,
      },
    });
  }

  function reset() {
    setValues({ carKm: "", flightHours: "", electricityKwh: "", meatMeals: "", vegMeals: "", shopping: "" });
    setResult(null);
  }

  const rating =
    result === null
      ? null
      : result.total < 200
      ? { label: "Excellent 🌟", color: "text-emerald-400" }
      : result.total < 400
      ? { label: "Good 👍", color: "text-teal-400" }
      : result.total < 700
      ? { label: "Average ⚠️", color: "text-yellow-400" }
      : { label: "High — let's improve! 🔴", color: "text-red-400" };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🧮 Carbon Calculator</h1>
        <p className="text-muted-foreground mt-1">Fill in your monthly habits to estimate your footprint</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          {
            category: "🚗 Transport",
            fields: [
              { key: "carKm", label: "Car travel (km/week)", placeholder: "e.g. 100", hint: "×0.21 kg CO₂/km × 4.33 weeks" },
              { key: "flightHours", label: "Flights (hours/year)", placeholder: "e.g. 10", hint: "≈90 kg CO₂/hr ÷ 12 months" },
            ],
          },
          {
            category: "⚡ Electricity",
            fields: [
              { key: "electricityKwh", label: "Monthly electricity (kWh)", placeholder: "e.g. 300", hint: "×0.45 kg CO₂/kWh" },
            ],
          },
          {
            category: "🥩 Food",
            fields: [
              { key: "meatMeals", label: "Meat meals per week", placeholder: "e.g. 7", hint: "≈2.5 kg CO₂/meal × 4.33" },
              { key: "vegMeals", label: "Vegetarian meals per week", placeholder: "e.g. 7", hint: "≈0.5 kg CO₂/meal × 4.33" },
            ],
          },
          {
            category: "🛍️ Shopping",
            fields: [
              { key: "shopping", label: "Monthly spend on new goods (£)", placeholder: "e.g. 200", hint: "≈0.5 kg CO₂ per £ spent" },
            ],
          },
        ].map((section) => (
          <div key={section.category} className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-bold mb-4">{section.category}</h2>
            <div className="space-y-4">
              {section.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">{field.label}</label>
                  <input
                    type="number"
                    min="0"
                    placeholder={field.placeholder}
                    value={values[field.key as keyof typeof values]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/30 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{field.hint}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Result */}
      <div className={`rounded-2xl border p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${result ? "border-emerald-500/30 bg-emerald-500/10" : "border-border bg-card"}`}>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Estimated Monthly Footprint</p>
          {result ? (
            <>
              <p className="text-5xl font-extrabold text-emerald-400">{result.total} <span className="text-2xl">kg CO₂</span></p>
              <p className={`text-sm font-medium mt-1 ${rating?.color}`}>{rating?.label}</p>
              <div className="flex flex-wrap gap-3 mt-3">
                {Object.entries(result.breakdown).map(([k, v]) => (
                  <span key={k} className="text-xs px-3 py-1 rounded-full border border-border bg-muted/50">
                    {k}: <strong>{v} kg</strong>
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="text-3xl font-bold text-muted-foreground">--- kg CO₂</p>
          )}
        </div>
        <div className="flex gap-3">
          {result && (
            <button onClick={reset} className="px-5 py-3 border border-border rounded-xl text-sm font-semibold hover:bg-muted/50 transition-all">
              Reset
            </button>
          )}
          <button
            onClick={calculate}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/25"
          >
            Calculate →
          </button>
        </div>
      </div>
    </div>
  );
}
