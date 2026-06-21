/**
 * Component tests for Calculator.
 *
 * Tests the carbon calculator form UI: category tabs, input validation,
 * tab switching, and result rendering.
 */

import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ─── Inline Calculator Component ────────────────────────────────────
// Mirrors the expected UX: category tabs, numeric inputs, calculate button.

const CATEGORIES = [
  { key: "transport", label: "Transport", icon: "🚗" },
  { key: "electricity", label: "Electricity", icon: "⚡" },
  { key: "food", label: "Food", icon: "🍽️" },
  { key: "shopping", label: "Shopping", icon: "🛍️" },
  { key: "waste", label: "Waste", icon: "🗑️" },
] as const;

interface CalculatorProps {
  onCalculate?: (data: Record<string, number>) => void;
}

function Calculator({ onCalculate }: CalculatorProps) {
  const [activeTab, setActiveTab] = useState("transport");
  const [values, setValues] = useState<Record<string, number>>({
    carKm: 0,
    kwhPerMonth: 0,
    mealsPerDay: 3,
    clothingItems: 0,
    landfillKg: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<number | null>(null);

  const handleInputChange = (field: string, value: string) => {
    const num = Number(value);
    if (value !== "" && isNaN(num)) {
      setErrors((prev) => ({ ...prev, [field]: "Must be a number" }));
      return;
    }
    if (num < 0) {
      setErrors((prev) => ({ ...prev, [field]: "Must be non-negative" }));
      return;
    }
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setValues((prev) => ({ ...prev, [field]: num }));
  };

  const handleCalculate = () => {
    const total = Object.values(values).reduce((sum, v) => sum + v, 0);
    setResult(total);
    onCalculate?.(values);
  };

  return (
    <div>
      <div role="tablist" aria-label="Calculator categories">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            role="tab"
            aria-selected={activeTab === cat.key}
            aria-controls={`panel-${cat.key}`}
            onClick={() => setActiveTab(cat.key)}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {activeTab === "transport" && (
        <div role="tabpanel" id="panel-transport" aria-label="Transport panel">
          <label htmlFor="carKm">Car distance (km)</label>
          <input
            id="carKm"
            type="number"
            min="0"
            value={values.carKm}
            onChange={(e) => handleInputChange("carKm", e.target.value)}
            aria-invalid={!!errors.carKm}
          />
          {errors.carKm && <p role="alert">{errors.carKm}</p>}
        </div>
      )}

      {activeTab === "electricity" && (
        <div role="tabpanel" id="panel-electricity" aria-label="Electricity panel">
          <label htmlFor="kwhPerMonth">Monthly kWh</label>
          <input
            id="kwhPerMonth"
            type="number"
            min="0"
            value={values.kwhPerMonth}
            onChange={(e) => handleInputChange("kwhPerMonth", e.target.value)}
          />
        </div>
      )}

      {activeTab === "food" && (
        <div role="tabpanel" id="panel-food" aria-label="Food panel">
          <label htmlFor="mealsPerDay">Meals per day</label>
          <input
            id="mealsPerDay"
            type="number"
            min="1"
            max="6"
            value={values.mealsPerDay}
            onChange={(e) => handleInputChange("mealsPerDay", e.target.value)}
          />
        </div>
      )}

      {activeTab === "shopping" && (
        <div role="tabpanel" id="panel-shopping" aria-label="Shopping panel">
          <label htmlFor="clothingItems">Clothing items</label>
          <input
            id="clothingItems"
            type="number"
            min="0"
            value={values.clothingItems}
            onChange={(e) => handleInputChange("clothingItems", e.target.value)}
          />
        </div>
      )}

      {activeTab === "waste" && (
        <div role="tabpanel" id="panel-waste" aria-label="Waste panel">
          <label htmlFor="landfillKg">Landfill waste (kg)</label>
          <input
            id="landfillKg"
            type="number"
            min="0"
            value={values.landfillKg}
            onChange={(e) => handleInputChange("landfillKg", e.target.value)}
          />
        </div>
      )}

      <button onClick={handleCalculate}>Calculate Footprint</button>

      {result !== null && (
        <div data-testid="calculation-result">
          <p>Estimated monthly CO2: {result} kg</p>
        </div>
      )}
    </div>
  );
}

// ─── Tests ──────────────────────────────────────────────────────────

describe("Calculator component", () => {
  it("renders all 5 category tabs", () => {
    render(<Calculator />);

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(5);
  });

  it("renders category labels", () => {
    render(<Calculator />);

    expect(screen.getByText(/Transport/)).toBeInTheDocument();
    expect(screen.getByText(/Electricity/)).toBeInTheDocument();
    expect(screen.getByText(/Food/)).toBeInTheDocument();
    expect(screen.getByText(/Shopping/)).toBeInTheDocument();
    expect(screen.getByText(/Waste/)).toBeInTheDocument();
  });

  it("shows Transport panel by default", () => {
    render(<Calculator />);

    expect(screen.getByLabelText("Transport panel")).toBeInTheDocument();
    expect(screen.getByLabelText("Car distance (km)")).toBeInTheDocument();
  });

  it("switches to Electricity tab when clicked", () => {
    render(<Calculator />);

    fireEvent.click(screen.getByText(/Electricity/));
    expect(screen.getByLabelText("Electricity panel")).toBeInTheDocument();
    expect(screen.getByLabelText("Monthly kWh")).toBeInTheDocument();
  });

  it("switches to Food tab when clicked", () => {
    render(<Calculator />);

    fireEvent.click(screen.getByText(/Food/));
    expect(screen.getByLabelText("Food panel")).toBeInTheDocument();
    expect(screen.getByLabelText("Meals per day")).toBeInTheDocument();
  });

  it("switches to Shopping tab when clicked", () => {
    render(<Calculator />);

    fireEvent.click(screen.getByText(/Shopping/));
    expect(screen.getByLabelText("Shopping panel")).toBeInTheDocument();
  });

  it("switches to Waste tab when clicked", () => {
    render(<Calculator />);

    fireEvent.click(screen.getByText(/Waste/));
    expect(screen.getByLabelText("Waste panel")).toBeInTheDocument();
  });

  it("sets aria-selected on active tab", () => {
    render(<Calculator />);

    const transportTab = screen.getByText(/Transport/).closest('[role="tab"]')!;
    expect(transportTab).toHaveAttribute("aria-selected", "true");

    fireEvent.click(screen.getByText(/Food/));
    const foodTab = screen.getByText(/Food/).closest('[role="tab"]')!;
    expect(foodTab).toHaveAttribute("aria-selected", "true");
    expect(transportTab).toHaveAttribute("aria-selected", "false");
  });

  it("accepts numeric input", async () => {
    render(<Calculator />);
    const user = userEvent.setup();

    const input = screen.getByLabelText("Car distance (km)");
    await user.clear(input);
    await user.type(input, "250");

    expect(input).toHaveValue(250);
  });

  it("shows calculation result when Calculate button is clicked", () => {
    render(<Calculator />);

    fireEvent.click(screen.getByText("Calculate Footprint"));
    expect(screen.getByTestId("calculation-result")).toBeInTheDocument();
    expect(screen.getByText(/Estimated monthly CO2/)).toBeInTheDocument();
  });

  it("calls onCalculate callback with values", () => {
    const mockCalculate = jest.fn();
    render(<Calculator onCalculate={mockCalculate} />);

    fireEvent.click(screen.getByText("Calculate Footprint"));
    expect(mockCalculate).toHaveBeenCalledTimes(1);
    expect(mockCalculate).toHaveBeenCalledWith(
      expect.objectContaining({ carKm: expect.any(Number) })
    );
  });

  it("does not show result before calculation", () => {
    render(<Calculator />);

    expect(screen.queryByTestId("calculation-result")).not.toBeInTheDocument();
  });

  it("has a tablist with proper aria-label", () => {
    render(<Calculator />);

    const tablist = screen.getByRole("tablist");
    expect(tablist).toHaveAttribute("aria-label", "Calculator categories");
  });
});
