/**
 * Unit tests for carbon calculation service logic.
 *
 * These tests validate the core CO2 computation that multiplies
 * activity values by emission factors, sums category breakdowns,
 * and compares against the national average.
 */

import {
  EMISSION_FACTORS,
  NATIONAL_AVERAGE_MONTHLY_CO2,
  getEmissionFactor,
} from "@/constants/emission-factors";
import type { CalculatorFormData } from "@/types/carbon.types";

// ─── Pure helper functions (extracted from service logic) ───────────
// These mirror the calculation logic that the API route uses.

/**
 * Calculate CO2 in kg for a single activity.
 */
function calculateActivityCO2(
  category: string,
  subcategory: string,
  value: number
): number {
  const factor = getEmissionFactor(category, subcategory);
  if (!factor) return 0;
  return value * factor.factor;
}

/**
 * Calculate total monthly footprint from calculator form data.
 */
function calculateFootprint(data: CalculatorFormData): {
  totalCo2Kg: number;
  breakdown: { category: string; co2Kg: number; percentage: number }[];
} {
  const carSubcategory = `car_${data.transport.carType}`;
  const transportCO2 =
    calculateActivityCO2("TRANSPORT", carSubcategory, data.transport.carKm) +
    calculateActivityCO2("TRANSPORT", "bus", data.transport.busKm) +
    calculateActivityCO2("TRANSPORT", "train", data.transport.trainKm) +
    calculateActivityCO2("TRANSPORT", "flight_domestic", data.transport.flightKm) +
    calculateActivityCO2("TRANSPORT", "bike", data.transport.bikeKm);

  const electricityCO2 = calculateActivityCO2(
    "ELECTRICITY",
    "grid_average",
    data.electricity.kwhPerMonth
  );

  const foodCO2 = calculateActivityCO2(
    "FOOD",
    data.food.dietType,
    data.food.mealsPerDay * 30
  );

  const shoppingCO2 =
    calculateActivityCO2("SHOPPING", "clothing", data.shopping.clothingItems) +
    calculateActivityCO2("SHOPPING", "electronics", data.shopping.electronicsItems) +
    calculateActivityCO2("SHOPPING", "general", data.shopping.generalItems);

  const wasteCO2 =
    calculateActivityCO2("WASTE", "landfill", data.waste.landfillKg) +
    calculateActivityCO2("WASTE", "recycled", data.waste.recycledKg) +
    calculateActivityCO2("WASTE", "composted", data.waste.compostedKg);

  const totalCo2Kg = transportCO2 + electricityCO2 + foodCO2 + shoppingCO2 + wasteCO2;

  const breakdown = [
    { category: "TRANSPORT", co2Kg: transportCO2 },
    { category: "ELECTRICITY", co2Kg: electricityCO2 },
    { category: "FOOD", co2Kg: foodCO2 },
    { category: "SHOPPING", co2Kg: shoppingCO2 },
    { category: "WASTE", co2Kg: wasteCO2 },
  ].map((item) => ({
    ...item,
    percentage: totalCo2Kg > 0 ? (item.co2Kg / totalCo2Kg) * 100 : 0,
  }));

  return { totalCo2Kg, breakdown };
}

/**
 * Compare footprint against national average.
 */
function compareWithAverage(monthlyKg: number): {
  percentageDiff: number;
  label: string;
} {
  const pct =
    ((monthlyKg - NATIONAL_AVERAGE_MONTHLY_CO2) / NATIONAL_AVERAGE_MONTHLY_CO2) * 100;
  const label =
    pct < 0 ? "below average" : pct > 0 ? "above average" : "at average";
  return { percentageDiff: pct, label };
}

// ─── Tests ──────────────────────────────────────────────────────────

describe("calculateActivityCO2()", () => {
  it("returns correct CO2 for petrol car driving", () => {
    const co2 = calculateActivityCO2("TRANSPORT", "car_petrol", 100);
    expect(co2).toBeCloseTo(21, 1); // 100 * 0.21
  });

  it("returns 0 for bicycle (zero-emission)", () => {
    const co2 = calculateActivityCO2("TRANSPORT", "bike", 50);
    expect(co2).toBe(0);
  });

  it("returns 0 for unknown subcategory", () => {
    const co2 = calculateActivityCO2("TRANSPORT", "hovercraft", 100);
    expect(co2).toBe(0);
  });

  it("returns 0 for zero value", () => {
    const co2 = calculateActivityCO2("TRANSPORT", "car_petrol", 0);
    expect(co2).toBe(0);
  });

  it("handles very large values without overflow", () => {
    const co2 = calculateActivityCO2("TRANSPORT", "car_petrol", 100000);
    expect(co2).toBeCloseTo(21000, 0); // 100000 * 0.21
    expect(isFinite(co2)).toBe(true);
  });

  it("returns correct CO2 for grid electricity", () => {
    const co2 = calculateActivityCO2("ELECTRICITY", "grid_average", 200);
    expect(co2).toBeCloseTo(105.4, 1); // 200 * 0.527
  });

  it("returns correct CO2 for non-veg meals", () => {
    const co2 = calculateActivityCO2("FOOD", "non_veg", 90);
    expect(co2).toBeCloseTo(297, 0); // 90 * 3.3
  });

  it("returns correct CO2 for electronics shopping", () => {
    const co2 = calculateActivityCO2("SHOPPING", "electronics", 2);
    expect(co2).toBe(100); // 2 * 50
  });

  it("returns correct CO2 for landfill waste", () => {
    const co2 = calculateActivityCO2("WASTE", "landfill", 10);
    expect(co2).toBeCloseTo(5.8, 1); // 10 * 0.58
  });
});

describe("calculateFootprint()", () => {
  const zeroData: CalculatorFormData = {
    transport: { carKm: 0, carType: "petrol", busKm: 0, trainKm: 0, flightKm: 0, bikeKm: 0 },
    electricity: { kwhPerMonth: 0 },
    food: { dietType: "non_veg", mealsPerDay: 3 },
    shopping: { clothingItems: 0, electronicsItems: 0, generalItems: 0 },
    waste: { landfillKg: 0, recycledKg: 0, compostedKg: 0 },
  };

  it("returns non-zero total for typical data", () => {
    const data: CalculatorFormData = {
      transport: { carKm: 500, carType: "petrol", busKm: 100, trainKm: 50, flightKm: 0, bikeKm: 20 },
      electricity: { kwhPerMonth: 300 },
      food: { dietType: "non_veg", mealsPerDay: 3 },
      shopping: { clothingItems: 3, electronicsItems: 1, generalItems: 5 },
      waste: { landfillKg: 15, recycledKg: 10, compostedKg: 5 },
    };
    const result = calculateFootprint(data);
    expect(result.totalCo2Kg).toBeGreaterThan(0);
  });

  it("breakdown percentages sum to 100 (or 0 if total is 0)", () => {
    const data: CalculatorFormData = {
      transport: { carKm: 200, carType: "diesel", busKm: 50, trainKm: 0, flightKm: 0, bikeKm: 0 },
      electricity: { kwhPerMonth: 150 },
      food: { dietType: "vegetarian", mealsPerDay: 2 },
      shopping: { clothingItems: 1, electronicsItems: 0, generalItems: 2 },
      waste: { landfillKg: 5, recycledKg: 3, compostedKg: 1 },
    };
    const result = calculateFootprint(data);
    const sum = result.breakdown.reduce((acc, b) => acc + b.percentage, 0);
    expect(sum).toBeCloseTo(100, 0);
  });

  it("handles all-zero inputs (food still contributes if mealsPerDay > 0)", () => {
    // Even with 0 transport, 0 electricity, etc., food (3 meals/day * 30 days * factor) is non-zero
    const result = calculateFootprint(zeroData);
    // non_veg: 3 * 30 * 3.3 = 297
    expect(result.totalCo2Kg).toBeCloseTo(297, 0);
  });

  it("breakdown has 5 categories", () => {
    const result = calculateFootprint(zeroData);
    expect(result.breakdown.length).toBe(5);
  });

  it("correctly computes transport for electric car", () => {
    const data: CalculatorFormData = {
      ...zeroData,
      transport: { carKm: 1000, carType: "electric", busKm: 0, trainKm: 0, flightKm: 0, bikeKm: 0 },
    };
    const result = calculateFootprint(data);
    const transport = result.breakdown.find((b) => b.category === "TRANSPORT");
    expect(transport!.co2Kg).toBeCloseTo(50, 0); // 1000 * 0.05
  });

  it("vegan diet produces less CO2 than non-veg", () => {
    const nonVeg = calculateFootprint({
      ...zeroData,
      food: { dietType: "non_veg", mealsPerDay: 3 },
    });
    const vegan = calculateFootprint({
      ...zeroData,
      food: { dietType: "vegan", mealsPerDay: 3 },
    });
    expect(vegan.totalCo2Kg).toBeLessThan(nonVeg.totalCo2Kg);
  });

  it("each breakdown category CO2 sums to the total", () => {
    const data: CalculatorFormData = {
      transport: { carKm: 100, carType: "petrol", busKm: 20, trainKm: 30, flightKm: 0, bikeKm: 0 },
      electricity: { kwhPerMonth: 250 },
      food: { dietType: "vegetarian", mealsPerDay: 2 },
      shopping: { clothingItems: 2, electronicsItems: 1, generalItems: 3 },
      waste: { landfillKg: 8, recycledKg: 4, compostedKg: 2 },
    };
    const result = calculateFootprint(data);
    const sumFromBreakdown = result.breakdown.reduce((s, b) => s + b.co2Kg, 0);
    expect(sumFromBreakdown).toBeCloseTo(result.totalCo2Kg, 5);
  });
});

describe("compareWithAverage()", () => {
  it("returns negative percentage for below-average footprint", () => {
    const result = compareWithAverage(300);
    expect(result.percentageDiff).toBeLessThan(0);
    expect(result.label).toBe("below average");
  });

  it("returns positive percentage for above-average footprint", () => {
    const result = compareWithAverage(600);
    expect(result.percentageDiff).toBeGreaterThan(0);
    expect(result.label).toBe("above average");
  });

  it("returns 0 for exact average", () => {
    const result = compareWithAverage(NATIONAL_AVERAGE_MONTHLY_CO2);
    expect(result.percentageDiff).toBe(0);
    expect(result.label).toBe("at average");
  });

  it("returns correct percentage", () => {
    // 500 vs 417: (500-417)/417 ≈ 19.9%
    const result = compareWithAverage(500);
    expect(result.percentageDiff).toBeCloseTo(19.9, 0);
  });

  it("handles zero footprint", () => {
    const result = compareWithAverage(0);
    expect(result.percentageDiff).toBe(-100);
    expect(result.label).toBe("below average");
  });
});
