import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vitest";
import { Timetable } from "@/features/timetable/Timetable";
import { loadAttendees, loadClasses } from "@/mocks/services";
import type { ClassRow } from "@/features/timetable/types";

vi.mock("@/mocks/services", () => ({ loadClasses: vi.fn(), loadAttendees: vi.fn() }));
const load = vi.mocked(loadClasses);
const classes: readonly ClassRow[] = [{
  id: "class-1", name: "Yoga Flow", instructorName: "Emma Wilson",
  startsAt: "2026-11-02T08:00:00+08:00", endsAt: "2026-11-02T09:00:00+08:00",
  bookedCount: 1, capacity: 15, status: "scheduled",
  attendees: [{ id: "a-1", customerName: "Jamie Tan", paymentType: "membership", bookingStatus: "booked" }],
}];

beforeEach(() => { load.mockReset(); vi.mocked(loadAttendees).mockReset(); });

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

test("attendee modes use real sources, recover row errors and abort old mode requests", async () => {
  const user = userEvent.setup();
  load.mockResolvedValue(classes);
  vi.mocked(loadAttendees).mockRejectedValueOnce(new Error("Attendees unavailable"))
    .mockResolvedValueOnce(classes[0].attendees);
  render(<Timetable />);
  await screen.findByRole("button", { name: "Expand Yoga Flow attendees" });
  const select = screen.getByRole("combobox", { name: "Attendee loading" });
  expect(select).toHaveValue("inline");
  await user.click(screen.getByRole("button", { name: "Expand Yoga Flow attendees" }));
  expect(screen.getByText("Jamie Tan")).toBeVisible();
  expect(loadAttendees).not.toHaveBeenCalled();
  await user.selectOptions(select, "lazy");
  expect(screen.queryByText("Jamie Tan")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Expand Yoga Flow attendees" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Attendees unavailable");
  await user.click(screen.getByRole("button", { name: "Retry details" }));
  expect(await screen.findByText("Jamie Tan")).toBeVisible();
  await user.selectOptions(select, "inline");
  await user.selectOptions(select, "lazy");
  let finish!: (attendees: readonly ClassRow["attendees"][number][]) => void;
  vi.mocked(loadAttendees).mockReturnValueOnce(new Promise(resolve => { finish = resolve; }));
  await user.click(screen.getByRole("button", { name: "Expand Yoga Flow attendees" }));
  expect(screen.getByText("Loading details…")).toBeVisible();
  const signal = vi.mocked(loadAttendees).mock.calls.at(-1)?.[1]?.signal;
  await user.selectOptions(select, "inline");
  expect(signal?.aborted).toBe(true);
  await act(async () => finish([{ ...classes[0].attendees[0], customerName: "Stale attendee" }]));
  await user.click(screen.getByRole("button", { name: "Expand Yoga Flow attendees" }));
  expect(screen.getByText("Jamie Tan")).toBeVisible();
  await waitFor(() => expect(screen.queryByText("Stale attendee")).not.toBeInTheDocument());
});
