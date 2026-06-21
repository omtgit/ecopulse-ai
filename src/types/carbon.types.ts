// ============================================
// Types — Carbon Footprint
// ============================================

/** Carbon emission categories */
export type CarbonCategoryType =
  | "TRANSPORT"
  | "ELECTRICITY"
  | "FOOD"
  | "SHOPPING"
  | "WASTE";

/** Transport subcategories */
export type TransportSubcategory =
  | "car_petrol"
  | "car_diesel"
  | "car_electric"
  | "bus"
  | "train"
  | "flight_domestic"
  | "flight_international"
  | "bike"
  | "walk";

/** Food diet types */
export type DietType = "non_veg" | "vegetarian" | "vegan";

/** Shopping item types */
export type ShoppingSubcategory =
  | "clothing"
  | "electronics"
  | "furniture"
  | "general";

/** Waste disposal methods */
export type WasteSubcategory = "landfill" | "recycled" | "composted";

/** Carbon entry for calculation */
export interface CarbonEntryInput {
  category: CarbonCategoryType;
  subcategory: string;
  value: number;
  unit: string;
  date?: Date;
  notes?: string;
}

/** Calculated carbon entry result */
export interface CarbonEntryResult extends CarbonEntryInput {
  co2Kg: number;
  month: number;
  year: number;
}

/** Monthly carbon summary */
export interface CarbonSummary {
  totalCo2Kg: number;
  categoryBreakdown: CategoryBreakdown[];
  comparisonWithAverage: number; // percentage vs national average
  reductionFromLastMonth: number; // percentage
  month: number;
  year: number;
}

/** Category breakdown item */
export interface CategoryBreakdown {
  category: CarbonCategoryType;
  co2Kg: number;
  percentage: number;
  entries: number;
}

/** Trend data point */
export interface TrendDataPoint {
  month: number;
  year: number;
  label: string; // "Jan 2026"
  totalCo2: number;
  transport: number;
  electricity: number;
  food: number;
  shopping: number;
  waste: number;
}

/** Carbon calculator form data */
export interface CalculatorFormData {
  transport: {
    carKm: number;
    carType: "petrol" | "diesel" | "electric";
    busKm: number;
    trainKm: number;
    flightKm: number;
    bikeKm: number;
  };
  electricity: {
    kwhPerMonth: number;
  };
  food: {
    dietType: DietType;
    mealsPerDay: number;
  };
  shopping: {
    clothingItems: number;
    electronicsItems: number;
    generalItems: number;
  };
  waste: {
    landfillKg: number;
    recycledKg: number;
    compostedKg: number;
  };
}

/** Emission factor definition */
export interface EmissionFactor {
  category: CarbonCategoryType;
  subcategory: string;
  factor: number; // kg CO2 per unit
  unit: string;
  label: string;
  description: string;
}
