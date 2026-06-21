/**
 * Component tests for HabitCheckin.
 *
 * Tests the daily habit check-in UI: habit option rendering,
 * toggling completion state, and impact estimate display.
 */

import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { HABIT_DEFINITIONS } from "@/constants/challenges";

// ─── Inline HabitCheckin Component ──────────────────────────────────

interface HabitState {
  habitType: string;
  completed: boolean;
}

interface HabitCheckinProps {
  date?: string;
  onSave?: (habits: HabitState[]) => void;
}

function HabitCheckin({ date = "2026-06-21", onSave }: HabitCheckinProps) {
  const [habits, setHabits] = useState<HabitState[]>(
    HABIT_DEFINITIONS.map((h) => ({
      habitType: h.type,
      completed: false,
    }))
  );

  const toggleHabit = (habitType: string) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.habitType === habitType ? { ...h, completed: !h.completed } : h
      )
    );
  };

  const completedCount = habits.filter((h) => h.completed).length;
  const totalImpact = habits.reduce((sum, h) => {
    if (!h.completed) return sum;
    const def = HABIT_DEFINITIONS.find((d) => d.type === h.habitType);
    return sum + (def?.impactKgPerDay ?? 0);
  }, 0);

  return (
    <div>
      <h2>Daily Check-in: {date}</h2>
      <p data-testid="completed-count">{completedCount} of {HABIT_DEFINITIONS.length} completed</p>

      <ul role="list" aria-label="Habit options">
        {HABIT_DEFINITIONS.map((habit) => {
          const state = habits.find((h) => h.habitType === habit.type);
          const isCompleted = state?.completed ?? false;

          return (
            <li key={habit.type} data-testid={`habit-${habit.type}`}>
              <button
                role="checkbox"
                aria-checked={isCompleted}
                aria-label={habit.label}
                onClick={() => toggleHabit(habit.type)}
                className={isCompleted ? "bg-green-100" : ""}
              >
                <span>{habit.icon}</span>
                <span>{habit.label}</span>
                {isCompleted && (
                  <span data-testid={`impact-${habit.type}`} className="text-green-600">
                    -{habit.impactKgPerDay} kg CO₂
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {totalImpact > 0 && (
        <div data-testid="total-impact">
          Total impact today: -{totalImpact.toFixed(1)} kg CO₂
        </div>
      )}

      <button
        onClick={() => onSave?.(habits)}
        disabled={completedCount === 0}
        data-testid="save-button"
      >
        Save Check-in
      </button>
    </div>
  );
}

// ─── Tests ──────────────────────────────────────────────────────────

describe("HabitCheckin component", () => {
  it("renders all habit options", () => {
    render(<HabitCheckin />);

    for (const habit of HABIT_DEFINITIONS) {
      expect(screen.getByLabelText(habit.label)).toBeInTheDocument();
    }
  });

  it("renders the date heading", () => {
    render(<HabitCheckin date="2026-06-21" />);

    expect(screen.getByText(/2026-06-21/)).toBeInTheDocument();
  });

  it("all habits start unchecked", () => {
    render(<HabitCheckin />);

    const checkboxes = screen.getAllByRole("checkbox");
    checkboxes.forEach((cb) => {
      expect(cb).toHaveAttribute("aria-checked", "false");
    });
  });

  it("toggles habit completion on click", () => {
    render(<HabitCheckin />);

    const bikeButton = screen.getByLabelText("Biked or Walked");
    expect(bikeButton).toHaveAttribute("aria-checked", "false");

    fireEvent.click(bikeButton);
    expect(bikeButton).toHaveAttribute("aria-checked", "true");

    fireEvent.click(bikeButton);
    expect(bikeButton).toHaveAttribute("aria-checked", "false");
  });

  it("shows impact estimate when habit is checked", () => {
    render(<HabitCheckin />);

    const bikeButton = screen.getByLabelText("Biked or Walked");
    fireEvent.click(bikeButton);

    const impact = screen.getByTestId("impact-BIKE_OR_WALK");
    expect(impact).toBeInTheDocument();
    expect(impact.textContent).toContain("3"); // 3.0 kg
    expect(impact.textContent).toContain("kg CO₂");
  });

  it("hides impact estimate when habit is unchecked", () => {
    render(<HabitCheckin />);

    const bikeButton = screen.getByLabelText("Biked or Walked");
    fireEvent.click(bikeButton);
    expect(screen.getByTestId("impact-BIKE_OR_WALK")).toBeInTheDocument();

    fireEvent.click(bikeButton);
    expect(screen.queryByTestId("impact-BIKE_OR_WALK")).not.toBeInTheDocument();
  });

  it("updates completed count on toggle", () => {
    render(<HabitCheckin />);

    expect(screen.getByTestId("completed-count")).toHaveTextContent("0 of 8 completed");

    fireEvent.click(screen.getByLabelText("Biked or Walked"));
    expect(screen.getByTestId("completed-count")).toHaveTextContent("1 of 8 completed");

    fireEvent.click(screen.getByLabelText("Ate Plant-Based Meal"));
    expect(screen.getByTestId("completed-count")).toHaveTextContent("2 of 8 completed");
  });

  it("shows total impact when habits are checked", () => {
    render(<HabitCheckin />);

    // Initially no total impact displayed
    expect(screen.queryByTestId("total-impact")).not.toBeInTheDocument();

    // Check "Biked or Walked" (3.0 kg)
    fireEvent.click(screen.getByLabelText("Biked or Walked"));
    expect(screen.getByTestId("total-impact")).toHaveTextContent("-3.0 kg CO₂");

    // Also check "Ate Plant-Based Meal" (2.5 kg) — total 5.5
    fireEvent.click(screen.getByLabelText("Ate Plant-Based Meal"));
    expect(screen.getByTestId("total-impact")).toHaveTextContent("-5.5 kg CO₂");
  });

  it("save button is disabled when no habits are checked", () => {
    render(<HabitCheckin />);

    const saveBtn = screen.getByTestId("save-button");
    expect(saveBtn).toBeDisabled();
  });

  it("save button is enabled when at least one habit is checked", () => {
    render(<HabitCheckin />);

    fireEvent.click(screen.getByLabelText("Used Reusable Bottle"));
    expect(screen.getByTestId("save-button")).not.toBeDisabled();
  });

  it("calls onSave with habit states when Save is clicked", () => {
    const mockSave = jest.fn();
    render(<HabitCheckin onSave={mockSave} />);

    fireEvent.click(screen.getByLabelText("Composted Waste"));
    fireEvent.click(screen.getByTestId("save-button"));

    expect(mockSave).toHaveBeenCalledTimes(1);
    const savedHabits = mockSave.mock.calls[0]![0];
    const compost = savedHabits.find(
      (h: HabitState) => h.habitType === "COMPOST_WASTE"
    );
    expect(compost.completed).toBe(true);
  });

  it("has a list with proper ARIA label", () => {
    render(<HabitCheckin />);

    const list = screen.getByRole("list", { name: "Habit options" });
    expect(list).toBeInTheDocument();
  });

  it("renders correct number of habit items", () => {
    render(<HabitCheckin />);

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(HABIT_DEFINITIONS.length);
  });
});
