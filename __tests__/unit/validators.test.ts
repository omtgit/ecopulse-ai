/**
 * Unit tests for src/lib/validators.ts
 *
 * Validates every Zod schema with correct, invalid, and boundary inputs.
 */

import {
  loginSchema,
  registerSchema,
  carbonEntrySchema,
  carbonCalculatorSchema,
  habitLogSchema,
  dailyCheckInSchema,
  joinChallengeSchema,
  updateChallengeSchema,
  updateProfileSchema,
  paginationSchema,
  monthYearSchema,
  carbonCategoryEnum,
  habitTypeEnum,
} from "@/lib/validators";

// ─── loginSchema ────────────────────────────────────────────────────
describe("loginSchema", () => {
  it("accepts a valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.path).toContain("email");
    }
  });

  it("rejects empty email", () => {
    const result = loginSchema.safeParse({ email: "", password: "password123" });
    expect(result.success).toBe(false);
  });

  it("rejects password shorter than 8 characters", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.path).toContain("password");
    }
  });

  it("rejects password longer than 128 characters", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "a".repeat(129),
    });
    expect(result.success).toBe(false);
  });

  it("accepts password of exactly 8 characters", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "12345678",
    });
    expect(result.success).toBe(true);
  });

  it("accepts password of exactly 128 characters", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "a".repeat(128),
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing fields", () => {
    expect(loginSchema.safeParse({}).success).toBe(false);
    expect(loginSchema.safeParse({ email: "user@example.com" }).success).toBe(false);
  });
});

// ─── registerSchema ─────────────────────────────────────────────────
describe("registerSchema", () => {
  const validInput = {
    name: "Jane Doe",
    email: "jane@example.com",
    password: "StrongPass1",
    confirmPassword: "StrongPass1",
  };

  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("rejects mismatching passwords", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      confirmPassword: "DifferentPass1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const pathStr = result.error.issues.map((i) => i.path.join("."));
      expect(pathStr).toContain("confirmPassword");
    }
  });

  it("rejects password without uppercase", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      password: "alllowercase1",
      confirmPassword: "alllowercase1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without lowercase", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      password: "ALLUPPERCASE1",
      confirmPassword: "ALLUPPERCASE1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without a number", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      password: "NoNumberHere",
      confirmPassword: "NoNumberHere",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name shorter than 2 characters", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      name: "J",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name with invalid characters", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      name: "Jane123",
    });
    expect(result.success).toBe(false);
  });

  it("accepts name with hyphens and apostrophes", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      name: "O'Brien-Smith",
    });
    expect(result.success).toBe(true);
  });

  it("rejects name longer than 50 characters", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      name: "A".repeat(51),
    });
    expect(result.success).toBe(false);
  });
});

// ─── carbonCategoryEnum ─────────────────────────────────────────────
describe("carbonCategoryEnum", () => {
  it("accepts all valid categories", () => {
    for (const cat of ["TRANSPORT", "ELECTRICITY", "FOOD", "SHOPPING", "WASTE"]) {
      expect(carbonCategoryEnum.safeParse(cat).success).toBe(true);
    }
  });

  it("rejects invalid category", () => {
    expect(carbonCategoryEnum.safeParse("INVALID").success).toBe(false);
  });
});

// ─── carbonEntrySchema ──────────────────────────────────────────────
describe("carbonEntrySchema", () => {
  const validEntry = {
    category: "TRANSPORT",
    subcategory: "car_petrol",
    value: 100,
    unit: "km",
  };

  it("accepts a valid carbon entry", () => {
    const result = carbonEntrySchema.safeParse(validEntry);
    expect(result.success).toBe(true);
  });

  it("rejects negative value", () => {
    const result = carbonEntrySchema.safeParse({ ...validEntry, value: -5 });
    expect(result.success).toBe(false);
  });

  it("accepts zero value", () => {
    const result = carbonEntrySchema.safeParse({ ...validEntry, value: 0 });
    expect(result.success).toBe(true);
  });

  it("rejects value over 100000", () => {
    const result = carbonEntrySchema.safeParse({ ...validEntry, value: 100001 });
    expect(result.success).toBe(false);
  });

  it("accepts value of exactly 100000", () => {
    const result = carbonEntrySchema.safeParse({ ...validEntry, value: 100000 });
    expect(result.success).toBe(true);
  });

  it("rejects empty subcategory", () => {
    const result = carbonEntrySchema.safeParse({ ...validEntry, subcategory: "" });
    expect(result.success).toBe(false);
  });

  it("rejects subcategory longer than 50 chars", () => {
    const result = carbonEntrySchema.safeParse({
      ...validEntry,
      subcategory: "x".repeat(51),
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid category", () => {
    const result = carbonEntrySchema.safeParse({
      ...validEntry,
      category: "INVALID",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional notes", () => {
    const result = carbonEntrySchema.safeParse({
      ...validEntry,
      notes: "Daily commute",
    });
    expect(result.success).toBe(true);
  });

  it("rejects notes over 500 characters", () => {
    const result = carbonEntrySchema.safeParse({
      ...validEntry,
      notes: "x".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional ISO date string", () => {
    const result = carbonEntrySchema.safeParse({
      ...validEntry,
      date: "2026-06-21T12:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });
});

// ─── carbonCalculatorSchema ─────────────────────────────────────────
describe("carbonCalculatorSchema", () => {
  it("accepts valid calculator data with defaults", () => {
    const result = carbonCalculatorSchema.safeParse({
      transport: { carKm: 50, carType: "petrol", busKm: 0, trainKm: 0, flightKm: 0, bikeKm: 0 },
      electricity: { kwhPerMonth: 200 },
      food: { dietType: "vegetarian", mealsPerDay: 3 },
      shopping: { clothingItems: 2, electronicsItems: 0, generalItems: 5 },
      waste: { landfillKg: 10, recycledKg: 5, compostedKg: 2 },
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative carKm", () => {
    const result = carbonCalculatorSchema.safeParse({
      transport: { carKm: -10, carType: "petrol", busKm: 0, trainKm: 0, flightKm: 0, bikeKm: 0 },
      electricity: { kwhPerMonth: 0 },
      food: { dietType: "non_veg", mealsPerDay: 3 },
      shopping: { clothingItems: 0, electronicsItems: 0, generalItems: 0 },
      waste: { landfillKg: 0, recycledKg: 0, compostedKg: 0 },
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid car type", () => {
    const result = carbonCalculatorSchema.safeParse({
      transport: { carKm: 10, carType: "hybrid", busKm: 0, trainKm: 0, flightKm: 0, bikeKm: 0 },
      electricity: { kwhPerMonth: 0 },
      food: { dietType: "non_veg", mealsPerDay: 3 },
      shopping: { clothingItems: 0, electronicsItems: 0, generalItems: 0 },
      waste: { landfillKg: 0, recycledKg: 0, compostedKg: 0 },
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid diet type", () => {
    const result = carbonCalculatorSchema.safeParse({
      transport: { carKm: 0, carType: "petrol", busKm: 0, trainKm: 0, flightKm: 0, bikeKm: 0 },
      electricity: { kwhPerMonth: 0 },
      food: { dietType: "keto", mealsPerDay: 3 },
      shopping: { clothingItems: 0, electronicsItems: 0, generalItems: 0 },
      waste: { landfillKg: 0, recycledKg: 0, compostedKg: 0 },
    });
    expect(result.success).toBe(false);
  });
});

// ─── habitLogSchema ─────────────────────────────────────────────────
describe("habitLogSchema", () => {
  it("accepts a valid habit log", () => {
    const result = habitLogSchema.safeParse({
      habitType: "PUBLIC_TRANSPORT",
      completed: true,
      date: "2026-06-21",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid habit type", () => {
    const result = habitLogSchema.safeParse({
      habitType: "INVALID_HABIT",
      completed: true,
      date: "2026-06-21",
    });
    expect(result.success).toBe(false);
  });

  it("rejects wrong date format (not YYYY-MM-DD)", () => {
    const result = habitLogSchema.safeParse({
      habitType: "BIKE_OR_WALK",
      completed: true,
      date: "21-06-2026",
    });
    expect(result.success).toBe(false);
  });

  it("rejects ISO datetime (only date accepted)", () => {
    const result = habitLogSchema.safeParse({
      habitType: "BIKE_OR_WALK",
      completed: true,
      date: "2026-06-21T12:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid habit types", () => {
    const validTypes = [
      "PUBLIC_TRANSPORT",
      "AVOID_PLASTIC",
      "REDUCE_ELECTRICITY",
      "REUSABLE_BOTTLE",
      "PLANT_BASED_MEAL",
      "COMPOST_WASTE",
      "BIKE_OR_WALK",
      "NO_FOOD_WASTE",
    ];
    for (const ht of validTypes) {
      const result = habitLogSchema.safeParse({
        habitType: ht,
        completed: false,
        date: "2026-01-01",
      });
      expect(result.success).toBe(true);
    }
  });

  it("accepts optional notes under 300 chars", () => {
    const result = habitLogSchema.safeParse({
      habitType: "COMPOST_WASTE",
      completed: true,
      date: "2026-06-21",
      notes: "Composted kitchen scraps",
    });
    expect(result.success).toBe(true);
  });

  it("rejects notes over 300 characters", () => {
    const result = habitLogSchema.safeParse({
      habitType: "COMPOST_WASTE",
      completed: true,
      date: "2026-06-21",
      notes: "x".repeat(301),
    });
    expect(result.success).toBe(false);
  });
});

// ─── habitTypeEnum ──────────────────────────────────────────────────
describe("habitTypeEnum", () => {
  it("accepts all eight habit types", () => {
    const types = [
      "PUBLIC_TRANSPORT", "AVOID_PLASTIC", "REDUCE_ELECTRICITY",
      "REUSABLE_BOTTLE", "PLANT_BASED_MEAL", "COMPOST_WASTE",
      "BIKE_OR_WALK", "NO_FOOD_WASTE",
    ];
    for (const t of types) {
      expect(habitTypeEnum.safeParse(t).success).toBe(true);
    }
  });

  it("rejects invalid type", () => {
    expect(habitTypeEnum.safeParse("FLY_TO_MOON").success).toBe(false);
  });
});

// ─── dailyCheckInSchema ─────────────────────────────────────────────
describe("dailyCheckInSchema", () => {
  it("accepts a valid daily check-in", () => {
    const result = dailyCheckInSchema.safeParse({
      date: "2026-06-21",
      habits: [
        { habitType: "BIKE_OR_WALK", completed: true },
        { habitType: "PLANT_BASED_MEAL", completed: false },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid date format", () => {
    const result = dailyCheckInSchema.safeParse({
      date: "June 21, 2026",
      habits: [],
    });
    expect(result.success).toBe(false);
  });
});

// ─── joinChallengeSchema ────────────────────────────────────────────
describe("joinChallengeSchema", () => {
  it("accepts a valid CUID", () => {
    const result = joinChallengeSchema.safeParse({
      challengeId: "clxyz12340000abcdef123456",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a non-CUID string", () => {
    const result = joinChallengeSchema.safeParse({ challengeId: "invalid" });
    expect(result.success).toBe(false);
  });
});

// ─── updateChallengeSchema ──────────────────────────────────────────
describe("updateChallengeSchema", () => {
  it("accepts progress 0-100", () => {
    expect(updateChallengeSchema.safeParse({ progress: 0 }).success).toBe(true);
    expect(updateChallengeSchema.safeParse({ progress: 50 }).success).toBe(true);
    expect(updateChallengeSchema.safeParse({ progress: 100 }).success).toBe(true);
  });

  it("rejects progress > 100", () => {
    expect(updateChallengeSchema.safeParse({ progress: 101 }).success).toBe(false);
  });

  it("rejects negative progress", () => {
    expect(updateChallengeSchema.safeParse({ progress: -1 }).success).toBe(false);
  });
});

// ─── updateProfileSchema ────────────────────────────────────────────
describe("updateProfileSchema", () => {
  it("accepts valid profile update", () => {
    const result = updateProfileSchema.safeParse({
      name: "Jane Doe",
      city: "Portland",
      country: "USA",
    });
    expect(result.success).toBe(true);
  });

  it("accepts partial update (optional fields)", () => {
    expect(updateProfileSchema.safeParse({}).success).toBe(true);
    expect(updateProfileSchema.safeParse({ city: "Berlin" }).success).toBe(true);
  });

  it("rejects name with invalid characters", () => {
    const result = updateProfileSchema.safeParse({ name: "Name123!" });
    expect(result.success).toBe(false);
  });
});

// ─── paginationSchema ───────────────────────────────────────────────
describe("paginationSchema", () => {
  it("accepts valid page and pageSize", () => {
    const result = paginationSchema.safeParse({ page: 1, pageSize: 20 });
    expect(result.success).toBe(true);
  });

  it("coerces string numbers", () => {
    const result = paginationSchema.safeParse({ page: "2", pageSize: "50" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.pageSize).toBe(50);
    }
  });

  it("rejects pageSize > 100", () => {
    const result = paginationSchema.safeParse({ page: 1, pageSize: 101 });
    expect(result.success).toBe(false);
  });

  it("rejects page < 1", () => {
    const result = paginationSchema.safeParse({ page: 0, pageSize: 20 });
    expect(result.success).toBe(false);
  });
});

// ─── monthYearSchema ────────────────────────────────────────────────
describe("monthYearSchema", () => {
  it("accepts valid month and year", () => {
    const result = monthYearSchema.safeParse({ month: 6, year: 2026 });
    expect(result.success).toBe(true);
  });

  it("rejects month 0", () => {
    expect(monthYearSchema.safeParse({ month: 0, year: 2026 }).success).toBe(false);
  });

  it("rejects month 13", () => {
    expect(monthYearSchema.safeParse({ month: 13, year: 2026 }).success).toBe(false);
  });

  it("rejects year before 2020", () => {
    expect(monthYearSchema.safeParse({ month: 1, year: 2019 }).success).toBe(false);
  });

  it("rejects year after 2100", () => {
    expect(monthYearSchema.safeParse({ month: 1, year: 2101 }).success).toBe(false);
  });
});
