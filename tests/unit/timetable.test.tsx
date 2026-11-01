import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vitest";
import { Timetable } from "@/features/timetable/Timetable";
import { loadClasses } from "@/mocks/services";
import type { ClassRow } from "@/features/timetable/types";

vi.mock("@/mocks/services", () => ({ loadClasses: vi.fn() }));
const load = vi.mocked(loadClasses);
const classes: readonly ClassRow[] = [{
  id: "class-1", name: "Yoga Flow", instructorName: "Emma Wilson",
  startsAt: "2026-11-02T08:00:00+08:00", endsAt: "2026-11-02T09:00:00+08:00",
  bookedCount: 1, capacity: 15, status: "scheduled",
  attendees: [{ id: "a-1", customerName: "Jamie Tan", paymentType: "membership", bookingStatus: "booked" }],
}];

beforeEach(() => { load.mockReset(); });

test("a failed class request can be retried into the real timetable with Singapore time", async () => {
  load.mockRejectedValueOnce(new Error("Unable to load classes."));
  load.mockResolvedValueOnce(classes);
  render(<Timetable />);
  expect(await screen.findByRole("alert")).toHaveTextContent("Unable to load classes.");
  await userEvent.setup().click(screen.getByRole("button", { name: "Retry" }));
  expect(await screen.findByRole("cell", { name: /Yoga Flow/ })).toBeInTheDocument();
  expect(screen.getByRole("cell", { name: /08:00 AM/ })).toBeInTheDocument();
  expect(screen.getByRole("table", { name: "Class timetable" })).toHaveAttribute("aria-busy", "false");
});

test("empty results are meaningful and unmount cancels pending class requests", async () => {
  load.mockResolvedValueOnce([]);
  const first = render(<Timetable />);
  expect(await screen.findByText("No classes available.")).toBeInTheDocument();
  first.unmount();

  load.mockReturnValueOnce(new Promise(() => {}));
  const pending = render(<Timetable />);
  const signal = load.mock.calls.at(-1)?.[0]?.signal;
  expect(signal?.aborted).toBe(false);
  pending.unmount();
  expect(signal?.aborted).toBe(true);
});
