/**
 * Unit tests for src/constants/emission-factors.ts
 *
 * Validates every emission factor is well-formed, lookup helpers work,
 * and edge-case category queries return sensible results.
 */

import {
  EMISSION_FACTORS,
  NATIONAL_AVERAGE_MONTHLY_CO2,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  getEmissionFactor,
  getFactorsByCategory,
} from "@/constants/emission-factors";
import type { EmissionFactor } from "@/types/carbon.types";

// ─── All known categories ───────────────────────────────────────────
const ALL_CATEGORIES = [
  "TRANSPORT",
  "ELECTRICITY",
  "FOOD",
  "SHOPPING",
  "WASTE",
] as const;

describe("EMISSION_FACTORS constant", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(EMISSION_FACTORS)).toBe(true);
    expect(EMISSION_FACTORS.length).toBeGreaterThan(0);
  });

  it("every category has at least one factor", () => {
    for (const cat of ALL_CATEGORIES) {
      const factors = EMISSION_FACTORS.filter((f) => f.category === cat);
      expect(factors.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("all factors have non-negative values", () => {
    for (const f of EMISSION_FACTORS) {
      expect(f.factor).toBeGreaterThanOrEqual(0);
    }
  });

  it("every factor has a non-empty label and description", () => {
    for (const f of EMISSION_FACTORS) {
      expect(f.label.length).toBeGreaterThan(0);
      expect(f.description.length).toBeGreaterThan(0);
    }
  });

  it("every factor has a non-empty unit", () => {
    for (const f of EMISSION_FACTORS) {
      expect(f.unit.length).toBeGreaterThan(0);
    }
  });

  it("every factor has a valid category", () => {
    const validCategories = new Set(ALL_CATEGORIES);
    for (const f of EMISSION_FACTORS) {
      expect(validCategories.has(f.category)).toBe(true);
    }
  });

  it("every factor has a non-empty subcategory", () => {
    for (const f of EMISSION_FACTORS) {
      expect(f.subcategory.length).toBeGreaterThan(0);
    }
  });

  it("has no duplicate (category, subcategory) pairs", () => {
    const keys = EMISSION_FACTORS.map(
      (f) => `${f.category}::${f.subcategory}`
    );
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("zero-emission factors exist for bike and walk", () => {
    const bike = EMISSION_FACTORS.find((f) => f.subcategory === "bike");
    const walk = EMISSION_FACTORS.find((f) => f.subcategory === "walk");
    expect(bike?.factor).toBe(0);
    expect(walk?.factor).toBe(0);
  });
});

describe("NATIONAL_AVERAGE_MONTHLY_CO2", () => {
  it("is a positive number", () => {
    expect(NATIONAL_AVERAGE_MONTHLY_CO2).toBeGreaterThan(0);
  });

  it("is 417 kg", () => {
    expect(NATIONAL_AVERAGE_MONTHLY_CO2).toBe(417);
  });
});

describe("CATEGORY_COLORS", () => {
  it("has a color entry for every category", () => {
    for (const cat of ALL_CATEGORIES) {
      expect(CATEGORY_COLORS[cat]).toBeDefined();
      expect(typeof CATEGORY_COLORS[cat]).toBe("string");
    }
  });

  it("colors are valid hex strings", () => {
    for (const cat of ALL_CATEGORIES) {
      expect(CATEGORY_COLORS[cat]).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});

describe("CATEGORY_LABELS", () => {
  it("has a label for every category", () => {
    for (const cat of ALL_CATEGORIES) {
      expect(CATEGORY_LABELS[cat]).toBeDefined();
      expect(CATEGORY_LABELS[cat]!.length).toBeGreaterThan(0);
    }
  });
});

describe("getEmissionFactor()", () => {
  it("returns the correct factor for a known pair", () => {
    const result = getEmissionFactor("TRANSPORT", "car_petrol");
    expect(result).toBeDefined();
    expect(result!.factor).toBe(0.21);
    expect(result!.unit).toBe("km");
    expect(result!.label).toBe("Car (Petrol)");
  });

  it("returns undefined for unknown category", () => {
    const result = getEmissionFactor("NONEXISTENT", "car_petrol");
    expect(result).toBeUndefined();
  });

  it("returns undefined for unknown subcategory", () => {
    const result = getEmissionFactor("TRANSPORT", "hovercraft");
    expect(result).toBeUndefined();
  });

  it("returns undefined for empty strings", () => {
    expect(getEmissionFactor("", "")).toBeUndefined();
  });

  it("returns correct factor for each category", () => {
    expect(getEmissionFactor("ELECTRICITY", "grid_average")?.factor).toBe(0.527);
    expect(getEmissionFactor("FOOD", "vegan")?.factor).toBe(0.9);
    expect(getEmissionFactor("SHOPPING", "electronics")?.factor).toBe(50);
    expect(getEmissionFactor("WASTE", "landfill")?.factor).toBe(0.58);
  });
});

describe("getFactorsByCategory()", () => {
  it("returns all TRANSPORT factors", () => {
    const factors = getFactorsByCategory("TRANSPORT");
    expect(factors.length).toBeGreaterThanOrEqual(7); // car_petrol, diesel, electric, bus, train, flight x2, bike, walk
    factors.forEach((f: EmissionFactor) => {
      expect(f.category).toBe("TRANSPORT");
    });
  });

  it("returns all FOOD factors", () => {
    const factors = getFactorsByCategory("FOOD");
    expect(factors.length).toBe(3); // non_veg, vegetarian, vegan
    factors.forEach((f: EmissionFactor) => {
      expect(f.category).toBe("FOOD");
    });
  });

  it("returns an empty array for an unknown category", () => {
    expect(getFactorsByCategory("NONEXISTENT")).toEqual([]);
  });

  it("returns correct subset for WASTE", () => {
    const factors = getFactorsByCategory("WASTE");
    expect(factors.length).toBe(3); // landfill, recycled, composted
    const subcategories = factors.map((f: EmissionFactor) => f.subcategory).sort();
    expect(subcategories).toEqual(["composted", "landfill", "recycled"]);
  });

  it("returns correct subset for ELECTRICITY", () => {
    const factors = getFactorsByCategory("ELECTRICITY");
    expect(factors.length).toBe(2);
    const subcategories = factors.map((f: EmissionFactor) => f.subcategory).sort();
    expect(subcategories).toEqual(["grid_average", "renewable"]);
  });

  it("returns correct subset for SHOPPING", () => {
    const factors = getFactorsByCategory("SHOPPING");
    expect(factors.length).toBe(4);
    const subcategories = factors.map((f: EmissionFactor) => f.subcategory).sort();
    expect(subcategories).toEqual(["clothing", "electronics", "furniture", "general"]);
  });
});
