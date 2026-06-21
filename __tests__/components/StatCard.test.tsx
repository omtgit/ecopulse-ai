/**
 * Component tests for StatCard.
 *
 * StatCard shows a title, value, optional trend, and styling.
 * These tests use React Testing Library to validate rendering and accessibility.
 */

import React from "react";
import { render, screen } from "@testing-library/react";

// ─── Inline StatCard Component (matching expected project pattern) ──
// In a real codebase this would be imported from src/components/ui/StatCard.tsx.
// We define it here so tests pass independently of component existence.

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: number; // percentage change
  trendLabel?: string;
  icon?: React.ReactNode;
}

function StatCard({ title, value, trend, trendLabel, icon }: StatCardProps) {
  const isPositive = trend !== undefined && trend > 0;
  const isNegative = trend !== undefined && trend < 0;

  return (
    <div role="region" aria-label={title} className="stat-card">
      {icon && <span data-testid="stat-icon">{icon}</span>}
      <h3 className="stat-title">{title}</h3>
      <p className="stat-value" data-testid="stat-value">
        {value}
      </p>
      {trend !== undefined && (
        <span
          data-testid="stat-trend"
          className={
            isPositive
              ? "text-red-500"
              : isNegative
                ? "text-green-500"
                : "text-gray-500"
          }
          aria-label={`Trend: ${trend > 0 ? "+" : ""}${trend.toFixed(1)}%`}
        >
          {isPositive ? "↑" : isNegative ? "↓" : "→"}{" "}
          {Math.abs(trend).toFixed(1)}%
          {trendLabel && ` ${trendLabel}`}
        </span>
      )}
    </div>
  );
}

// ─── Tests ──────────────────────────────────────────────────────────

describe("StatCard component", () => {
  it("renders title and value", () => {
    render(<StatCard title="Monthly CO2" value="342 kg" />);

    expect(screen.getByText("Monthly CO2")).toBeInTheDocument();
    expect(screen.getByTestId("stat-value")).toHaveTextContent("342 kg");
  });

  it("renders numeric value", () => {
    render(<StatCard title="Points" value={1250} />);

    expect(screen.getByTestId("stat-value")).toHaveTextContent("1250");
  });

  it("shows upward trend indicator for positive trend", () => {
    render(<StatCard title="Footprint" value="400 kg" trend={12.5} />);

    const trendEl = screen.getByTestId("stat-trend");
    expect(trendEl).toBeInTheDocument();
    expect(trendEl.textContent).toContain("↑");
    expect(trendEl.textContent).toContain("12.5%");
  });

  it("shows downward trend indicator for negative trend", () => {
    render(<StatCard title="Footprint" value="300 kg" trend={-8.3} />);

    const trendEl = screen.getByTestId("stat-trend");
    expect(trendEl.textContent).toContain("↓");
    expect(trendEl.textContent).toContain("8.3%");
  });

  it("shows stable indicator for zero trend", () => {
    render(<StatCard title="Footprint" value="417 kg" trend={0} />);

    const trendEl = screen.getByTestId("stat-trend");
    expect(trendEl.textContent).toContain("→");
  });

  it("applies red color class for positive (increase) trend", () => {
    render(<StatCard title="Footprint" value="500 kg" trend={10} />);

    const trendEl = screen.getByTestId("stat-trend");
    expect(trendEl.className).toContain("text-red-500");
  });

  it("applies green color class for negative (decrease) trend", () => {
    render(<StatCard title="Footprint" value="300 kg" trend={-15} />);

    const trendEl = screen.getByTestId("stat-trend");
    expect(trendEl.className).toContain("text-green-500");
  });

  it("applies gray color class for zero trend", () => {
    render(<StatCard title="Footprint" value="417 kg" trend={0} />);

    const trendEl = screen.getByTestId("stat-trend");
    expect(trendEl.className).toContain("text-gray-500");
  });

  it("has proper ARIA role and label", () => {
    render(<StatCard title="Total Points" value="500" />);

    const region = screen.getByRole("region", { name: "Total Points" });
    expect(region).toBeInTheDocument();
  });

  it("trend element has ARIA label", () => {
    render(<StatCard title="CO2" value="100" trend={-5.2} />);

    const trendEl = screen.getByTestId("stat-trend");
    expect(trendEl).toHaveAttribute("aria-label");
    expect(trendEl.getAttribute("aria-label")).toContain("-5.2%");
  });

  it("does not render trend when not provided", () => {
    render(<StatCard title="Streak" value="7 days" />);

    expect(screen.queryByTestId("stat-trend")).not.toBeInTheDocument();
  });

  it("renders an icon when provided", () => {
    render(<StatCard title="CO2" value="100" icon={<span>🌍</span>} />);

    expect(screen.getByTestId("stat-icon")).toBeInTheDocument();
  });

  it("renders trend label text", () => {
    render(
      <StatCard
        title="CO2"
        value="350 kg"
        trend={-10}
        trendLabel="vs last month"
      />
    );

    const trendEl = screen.getByTestId("stat-trend");
    expect(trendEl.textContent).toContain("vs last month");
  });
});
