import { z } from "zod";

/**
 * Zod validation schemas for all API inputs.
 * Used in both client-side forms and server-side API routes.
 */

// ---- Auth Schemas ----

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be under 128 characters"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be under 50 characters")
      .regex(/^[a-zA-Z\s'-]+$/, "Name contains invalid characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be under 128 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase, and a number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ---- Carbon Entry Schemas ----

export const carbonCategoryEnum = z.enum([
  "TRANSPORT",
  "ELECTRICITY",
  "FOOD",
  "SHOPPING",
  "WASTE",
]);

export const carbonEntrySchema = z.object({
  category: carbonCategoryEnum,
  subcategory: z
    .string()
    .min(1, "Subcategory is required")
    .max(50, "Subcategory is too long"),
  value: z
    .number()
    .min(0, "Value must be non-negative")
    .max(100000, "Value is too large"),
  unit: z.string().min(1).max(20),
  date: z.string().datetime().optional(),
  notes: z.string().max(500, "Notes must be under 500 characters").optional(),
});

export const carbonCalculatorSchema = z.object({
  transport: z.object({
    carKm: z.number().min(0).max(50000).default(0),
    carType: z.enum(["petrol", "diesel", "electric"]).default("petrol"),
    busKm: z.number().min(0).max(50000).default(0),
    trainKm: z.number().min(0).max(50000).default(0),
    flightKm: z.number().min(0).max(100000).default(0),
    bikeKm: z.number().min(0).max(50000).default(0),
  }),
  electricity: z.object({
    kwhPerMonth: z.number().min(0).max(10000).default(0),
  }),
  food: z.object({
    dietType: z.enum(["non_veg", "vegetarian", "vegan"]).default("non_veg"),
    mealsPerDay: z.number().min(1).max(6).default(3),
  }),
  shopping: z.object({
    clothingItems: z.number().min(0).max(100).default(0),
    electronicsItems: z.number().min(0).max(50).default(0),
    generalItems: z.number().min(0).max(200).default(0),
  }),
  waste: z.object({
    landfillKg: z.number().min(0).max(500).default(0),
    recycledKg: z.number().min(0).max(500).default(0),
    compostedKg: z.number().min(0).max(500).default(0),
  }),
});

// ---- Habit Schemas ----

export const habitTypeEnum = z.enum([
  "PUBLIC_TRANSPORT",
  "AVOID_PLASTIC",
  "REDUCE_ELECTRICITY",
  "REUSABLE_BOTTLE",
  "PLANT_BASED_MEAL",
  "COMPOST_WASTE",
  "BIKE_OR_WALK",
  "NO_FOOD_WASTE",
]);

export const habitLogSchema = z.object({
  habitType: habitTypeEnum,
  completed: z.boolean(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format"),
  notes: z.string().max(300).optional(),
});

export const dailyCheckInSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  habits: z.array(
    z.object({
      habitType: habitTypeEnum,
      completed: z.boolean(),
      notes: z.string().max(300).optional(),
    })
  ),
});

// ---- Challenge Schemas ----

export const joinChallengeSchema = z.object({
  challengeId: z.string().cuid("Invalid challenge ID"),
});

export const updateChallengeSchema = z.object({
  progress: z.number().min(0).max(100),
});

// ---- User Settings Schema ----

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-zA-Z\s'-]+$/)
    .optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
});

// ---- Query Params Schema ----

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});

export const monthYearSchema = z.object({
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2020).max(2100),
});

// ---- Type exports from schemas ----

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CarbonEntryInput = z.infer<typeof carbonEntrySchema>;
export type CarbonCalculatorInput = z.infer<typeof carbonCalculatorSchema>;
export type HabitLogInput = z.infer<typeof habitLogSchema>;
export type DailyCheckInInput = z.infer<typeof dailyCheckInSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
