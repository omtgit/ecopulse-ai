import type { EmissionFactor } from "@/types/carbon.types";

/**
 * Scientifically-sourced emission factors for CO2 calculation.
 * Sources: EPA, DEFRA, IPCC AR6
 *
 * All factors are in kg CO2 equivalent per unit.
 */
export const EMISSION_FACTORS: EmissionFactor[] = [
  // ---- Transport ----
  {
    category: "TRANSPORT",
    subcategory: "car_petrol",
    factor: 0.21,
    unit: "km",
    label: "Car (Petrol)",
    description: "Average petrol car emission per kilometer",
  },
  {
    category: "TRANSPORT",
    subcategory: "car_diesel",
    factor: 0.27,
    unit: "km",
    label: "Car (Diesel)",
    description: "Average diesel car emission per kilometer",
  },
  {
    category: "TRANSPORT",
    subcategory: "car_electric",
    factor: 0.05,
    unit: "km",
    label: "Car (Electric)",
    description: "Electric car including grid electricity",
  },
  {
    category: "TRANSPORT",
    subcategory: "bus",
    factor: 0.089,
    unit: "km",
    label: "Bus",
    description: "Public bus per passenger-kilometer",
  },
  {
    category: "TRANSPORT",
    subcategory: "train",
    factor: 0.041,
    unit: "km",
    label: "Train",
    description: "Rail per passenger-kilometer",
  },
  {
    category: "TRANSPORT",
    subcategory: "flight_domestic",
    factor: 0.255,
    unit: "km",
    label: "Flight (Domestic)",
    description: "Short-haul flight per passenger-kilometer",
  },
  {
    category: "TRANSPORT",
    subcategory: "flight_international",
    factor: 0.195,
    unit: "km",
    label: "Flight (International)",
    description: "Long-haul flight per passenger-kilometer",
  },
  {
    category: "TRANSPORT",
    subcategory: "bike",
    factor: 0,
    unit: "km",
    label: "Bicycle",
    description: "Zero direct emissions",
  },
  {
    category: "TRANSPORT",
    subcategory: "walk",
    factor: 0,
    unit: "km",
    label: "Walking",
    description: "Zero direct emissions",
  },

  // ---- Electricity ----
  {
    category: "ELECTRICITY",
    subcategory: "grid_average",
    factor: 0.527,
    unit: "kWh",
    label: "Grid Electricity",
    description: "Average grid electricity (global mean)",
  },
  {
    category: "ELECTRICITY",
    subcategory: "renewable",
    factor: 0.02,
    unit: "kWh",
    label: "Renewable Energy",
    description: "Solar/wind/hydro lifecycle emissions",
  },

  // ---- Food ----
  {
    category: "FOOD",
    subcategory: "non_veg",
    factor: 3.3,
    unit: "meals",
    label: "Non-Vegetarian Meal",
    description: "Average meat-based meal",
  },
  {
    category: "FOOD",
    subcategory: "vegetarian",
    factor: 1.7,
    unit: "meals",
    label: "Vegetarian Meal",
    description: "Plant + dairy based meal",
  },
  {
    category: "FOOD",
    subcategory: "vegan",
    factor: 0.9,
    unit: "meals",
    label: "Vegan Meal",
    description: "Fully plant-based meal",
  },

  // ---- Shopping ----
  {
    category: "SHOPPING",
    subcategory: "clothing",
    factor: 10,
    unit: "items",
    label: "Clothing Item",
    description: "Average clothing item production",
  },
  {
    category: "SHOPPING",
    subcategory: "electronics",
    factor: 50,
    unit: "items",
    label: "Electronics",
    description: "Average electronic device",
  },
  {
    category: "SHOPPING",
    subcategory: "furniture",
    factor: 30,
    unit: "items",
    label: "Furniture",
    description: "Average furniture item",
  },
  {
    category: "SHOPPING",
    subcategory: "general",
    factor: 5,
    unit: "items",
    label: "General Shopping",
    description: "Average consumer product",
  },

  // ---- Waste ----
  {
    category: "WASTE",
    subcategory: "landfill",
    factor: 0.58,
    unit: "kg",
    label: "Landfill Waste",
    description: "Waste sent to landfill",
  },
  {
    category: "WASTE",
    subcategory: "recycled",
    factor: 0.21,
    unit: "kg",
    label: "Recycled Waste",
    description: "Waste that is recycled",
  },
  {
    category: "WASTE",
    subcategory: "composted",
    factor: 0.1,
    unit: "kg",
    label: "Composted Waste",
    description: "Organic waste composted",
  },
];

/** National average monthly carbon footprint in kg CO2 */
export const NATIONAL_AVERAGE_MONTHLY_CO2 = 417;

/** Category colors for charts */
export const CATEGORY_COLORS: Record<string, string> = {
  TRANSPORT: "#f59e0b",
  ELECTRICITY: "#3b82f6",
  FOOD: "#10b981",
  SHOPPING: "#8b5cf6",
  WASTE: "#ef4444",
};

/** Category labels */
export const CATEGORY_LABELS: Record<string, string> = {
  TRANSPORT: "Transport",
  ELECTRICITY: "Electricity",
  FOOD: "Food & Diet",
  SHOPPING: "Shopping",
  WASTE: "Waste",
};

/** Category icons (emoji) */
export const CATEGORY_ICONS: Record<string, string> = {
  TRANSPORT: "🚗",
  ELECTRICITY: "⚡",
  FOOD: "🍽️",
  SHOPPING: "🛍️",
  WASTE: "🗑️",
};

/**
 * Look up emission factor by category and subcategory
 */
export function getEmissionFactor(
  category: string,
  subcategory: string
): EmissionFactor | undefined {
  return EMISSION_FACTORS.find(
    (f) => f.category === category && f.subcategory === subcategory
  );
}

/**
 * Get all emission factors for a category
 */
export function getFactorsByCategory(category: string): EmissionFactor[] {
  return EMISSION_FACTORS.filter((f) => f.category === category);
}
