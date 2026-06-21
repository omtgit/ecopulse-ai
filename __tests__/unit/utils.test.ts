/**
 * Unit tests for src/lib/utils.ts
 *
 * Covers every exported function with normal, boundary, and edge cases.
 */

import {
  cn,
  sanitizeInput,
  formatNumber,
  formatCO2,
  formatDate,
  formatMonthYear,
  percentageChange,
  clamp,
  debounce,
  getCurrentMonthYear,
  getGreeting,
  truncate,
} from "@/lib/utils";

// ─── cn() ───────────────────────────────────────────────────────────
describe("cn() – Tailwind class merger", () => {
  it("merges plain classes", () => {
    expect(cn("p-4", "mt-2")).toBe("p-4 mt-2");
  });

  it("resolves conflicting Tailwind utilities (last wins)", () => {
    const result = cn("p-4", "p-8");
    expect(result).toBe("p-8");
  });

  it("handles conditional classes via clsx syntax", () => {
    const result = cn("base", false && "hidden", "extra");
    expect(result).toBe("base extra");
  });

  it("handles empty arguments", () => {
    expect(cn()).toBe("");
  });

  it("handles undefined and null gracefully", () => {
    expect(cn("a", undefined, null, "b")).toBe("a b");
  });

  it("deduplicates identical classes", () => {
    const result = cn("text-red-500", "text-blue-500");
    // tailwind-merge keeps the last conflict
    expect(result).toBe("text-blue-500");
  });
});

// ─── formatNumber() ─────────────────────────────────────────────────
describe("formatNumber()", () => {
  it("formats with default 1 decimal", () => {
    expect(formatNumber(42)).toBe("42.0");
  });

  it("formats with 2 decimals", () => {
    expect(formatNumber(3.14159, 2)).toBe("3.14");
  });

  it("formats zero", () => {
    expect(formatNumber(0)).toBe("0.0");
  });

  it("formats large numbers with commas", () => {
    expect(formatNumber(1234567.89, 2)).toBe("1,234,567.89");
  });

  it("formats negative numbers", () => {
    expect(formatNumber(-42.5, 1)).toBe("-42.5");
  });

  it("handles 0 decimal places", () => {
    expect(formatNumber(99.9, 0)).toBe("100");
  });
});

// ─── formatCO2() ────────────────────────────────────────────────────
describe("formatCO2()", () => {
  it("formats values < 1000 as kg", () => {
    expect(formatCO2(42)).toBe("42.0 kg");
  });

  it("formats values >= 1000 as tonnes", () => {
    expect(formatCO2(1500)).toBe("1.5 t");
  });

  it("formats exactly 1000 as tonnes", () => {
    expect(formatCO2(1000)).toBe("1.0 t");
  });

  it("formats zero", () => {
    expect(formatCO2(0)).toBe("0.0 kg");
  });

  it("formats small values correctly", () => {
    expect(formatCO2(0.5)).toBe("0.5 kg");
  });

  it("formats large values as tonnes", () => {
    expect(formatCO2(12500)).toBe("12.5 t");
  });
});

// ─── formatDate() ───────────────────────────────────────────────────
describe("formatDate()", () => {
  it("formats a Date object", () => {
    const result = formatDate(new Date(2026, 0, 15)); // Jan 15, 2026
    expect(result).toMatch(/Jan/);
    expect(result).toMatch(/15/);
    expect(result).toMatch(/2026/);
  });

  it("formats an ISO string", () => {
    const result = formatDate("2026-06-21T12:00:00.000Z");
    expect(result).toMatch(/2026/);
  });
});

// ─── formatMonthYear() ──────────────────────────────────────────────
describe("formatMonthYear()", () => {
  it("formats month 1 as Jan", () => {
    const result = formatMonthYear(1, 2026);
    expect(result).toMatch(/Jan/);
    expect(result).toMatch(/2026/);
  });

  it("formats month 12 as Dec", () => {
    const result = formatMonthYear(12, 2026);
    expect(result).toMatch(/Dec/);
  });
});

// ─── percentageChange() ─────────────────────────────────────────────
describe("percentageChange()", () => {
  it("calculates positive increase", () => {
    expect(percentageChange(150, 100)).toBe(50);
  });

  it("calculates decrease", () => {
    expect(percentageChange(80, 100)).toBe(-20);
  });

  it("returns 0 when both values are 0", () => {
    expect(percentageChange(0, 0)).toBe(0);
  });

  it("returns 100 when previous is 0 and current > 0", () => {
    expect(percentageChange(50, 0)).toBe(100);
  });

  it("handles negative current with zero previous", () => {
    // Current is not > 0, so returns 0
    expect(percentageChange(-10, 0)).toBe(0);
  });

  it("returns -100 when current is 0 and previous is non-zero", () => {
    expect(percentageChange(0, 100)).toBe(-100);
  });

  it("handles equal values (no change)", () => {
    expect(percentageChange(100, 100)).toBe(0);
  });

  it("handles small fractional values correctly", () => {
    const result = percentageChange(1.05, 1.0);
    expect(result).toBeCloseTo(5, 1);
  });
});

// ─── clamp() ────────────────────────────────────────────────────────
describe("clamp()", () => {
  it("clamps value below minimum", () => {
    expect(clamp(-5, 0, 100)).toBe(0);
  });

  it("clamps value above maximum", () => {
    expect(clamp(150, 0, 100)).toBe(100);
  });

  it("passes through value within range", () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });

  it("clamps to exact boundary", () => {
    expect(clamp(0, 0, 100)).toBe(0);
    expect(clamp(100, 0, 100)).toBe(100);
  });
});

// ─── sanitizeInput() ────────────────────────────────────────────────
describe("sanitizeInput()", () => {
  it("strips HTML tags (server-side)", () => {
    const result = sanitizeInput("<script>alert('xss')</script>Hello");
    expect(result).not.toContain("<script>");
    expect(result).toContain("Hello");
  });

  it("strips javascript: protocol", () => {
    const result = sanitizeInput('javascript:alert("hi")');
    expect(result).not.toContain("javascript:");
  });

  it("strips on-event handlers", () => {
    const result = sanitizeInput('onclick=alert("hi")');
    expect(result).not.toMatch(/onclick=/i);
  });

  it("trims whitespace", () => {
    const result = sanitizeInput("  hello  ");
    expect(result).toBe("hello");
  });

  it("passes through clean strings", () => {
    expect(sanitizeInput("hello world")).toBe("hello world");
  });

  it("handles empty string", () => {
    expect(sanitizeInput("")).toBe("");
  });
});

// ─── debounce() ─────────────────────────────────────────────────────
describe("debounce()", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("delays execution by the specified ms", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 300);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("resets the timer on subsequent calls", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 300);

    debounced();
    jest.advanceTimersByTime(200);
    debounced(); // restart
    jest.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("passes arguments to the debounced function", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);

    debounced("a", "b");
    jest.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledWith("a", "b");
  });

  it("only fires once even with many rapid calls", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 200);

    for (let i = 0; i < 20; i++) {
      debounced();
    }
    jest.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

// ─── getCurrentMonthYear() ──────────────────────────────────────────
describe("getCurrentMonthYear()", () => {
  it("returns an object with month and year", () => {
    const result = getCurrentMonthYear();
    expect(result).toHaveProperty("month");
    expect(result).toHaveProperty("year");
    expect(result.month).toBeGreaterThanOrEqual(1);
    expect(result.month).toBeLessThanOrEqual(12);
    expect(result.year).toBeGreaterThanOrEqual(2020);
  });
});

// ─── getGreeting() ──────────────────────────────────────────────────
describe("getGreeting()", () => {
  it("returns a non-empty string", () => {
    const greeting = getGreeting();
    expect(typeof greeting).toBe("string");
    expect(greeting.length).toBeGreaterThan(0);
  });

  it("contains 'Good'", () => {
    expect(getGreeting()).toMatch(/^Good /);
  });
});

// ─── truncate() ─────────────────────────────────────────────────────
describe("truncate()", () => {
  it("returns the full string when short enough", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates and adds ellipsis", () => {
    const result = truncate("This is a long string", 10);
    expect(result).toBe("This is...");
    expect(result.length).toBe(10);
  });

  it("handles exact length", () => {
    expect(truncate("12345", 5)).toBe("12345");
  });

  it("handles empty string", () => {
    expect(truncate("", 5)).toBe("");
  });
});
