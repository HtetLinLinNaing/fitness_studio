import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test } from "vitest";
import { InventoryDemo } from "@/features/demo/InventoryDemo";
import { resetMockFailures } from "@/mocks/services";

beforeEach(resetMockFailures);
test("inventory formats SGD and retries detail errors without disabling the parent table", async () => {
  const user = userEvent.setup();
  render(<InventoryDemo />);
  await screen.findByText("S$28.00");
  await user.selectOptions(screen.getByRole("combobox", { name: "Detail response" }), "error");
  const toggle = await screen.findByRole("button", { name: "Expand Yoga Mat — Classic stock movements" });
  await user.click(toggle);
  expect(await screen.findByRole("alert")).toHaveTextContent("Unable to load stock movements");
  expect(screen.getByRole("button", { name: "Next page" })).toBeEnabled();
  await user.click(screen.getByRole("button", { name: "Retry details" }));
  const history = await screen.findByRole("table", { name: "Yoga Mat — Classic stock movements" });
  expect(within(history).getByRole("columnheader", { name: "Quantity change" })).toBeInTheDocument();
  await user.selectOptions(screen.getByRole("combobox", { name: "Detail response" }), "empty");
  await user.click(await screen.findByRole("button", { name: "Expand Yoga Mat — Classic stock movements" }));
  expect(await screen.findByText("No stock movements")).toBeInTheDocument();
}, 10000);
