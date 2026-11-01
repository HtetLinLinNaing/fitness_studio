import { expect, test } from "@playwright/test";

test("timetable renders real classes and keeps the class column pinned on narrow screens", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/classTimetable");

  await expect(page).toHaveTitle("HL Fitness Studio | Class timetable");
  await expect(page.getByRole("heading", { name: "Class timetable", exact: true })).toBeVisible();
  const table = page.getByRole("table", { name: "Class timetable", exact: true });
  const parents = table.locator(":scope > tbody > tr[data-parent-row]");
  await expect(table).toHaveAttribute("aria-busy", "false");
  await expect(parents.first()).toContainText("Yoga Flow");
  expect(await parents.count()).toBe(10);
  const expandYoga = page.getByRole("button", { name: "Expand Yoga Flow attendees" });
  await expandYoga.focus();
  await expandYoga.press("Enter");
  const yogaToggle = page.getByRole("button", { name: "Collapse Yoga Flow attendees" });
  await expect(yogaToggle).toHaveAttribute("aria-expanded", "true");
  const panelId = await yogaToggle.getAttribute("aria-controls");
  const panel = page.locator(`[id="${panelId}"]`);
  const attendees = page.getByRole("table", { name: "Yoga Flow attendees", exact: true });
  await expect(attendees).toBeVisible();
  await expect(attendees.getByRole("columnheader", { name: "Payment type" })).toBeVisible();
  await expect.poll(() => panel.evaluate(element => element.getBoundingClientRect().height)).toBeGreaterThan(100);
  await expect.poll(() => panel.evaluate(element => Math.abs(element.getBoundingClientRect().height - element.firstElementChild!.getBoundingClientRect().height))).toBeLessThan(2);
  expect(await parents.count()).toBe(10);
  await yogaToggle.click();
  await expect(panel).toHaveAttribute("inert", "");
  await expect.poll(() => panel.evaluate(element => element.getBoundingClientRect().height)).toBeLessThan(2);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expandYoga.click();
  await expect(panel).toHaveCSS("transition-duration", "0s");
  await yogaToggle.click();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.getByRole("button", { name: "Expand Barre Foundations attendees" }).click();
  await expect(page.getByText("No attendees", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Collapse Barre Foundations attendees" }).click();
  await expect(page.getByText("Page 1 of 2")).toBeVisible();
  await page.getByRole("button", { name: "Next page" }).click();
  await expect(parents.last()).toContainText("Evening Reset");
  expect(await parents.count()).toBe(2);
  await expect(page.getByText("11–12 of 12")).toBeVisible();
  await page.getByRole("button", { name: "Previous page" }).click();

  const sortClass = page.getByRole("button", { name: /^Sort by Class,/ });
  await sortClass.focus();
  await sortClass.press("Enter");
  await expect(table.locator("thead th:first-child")).toHaveAttribute("aria-sort", "ascending");
  await expect(table.locator("tbody tr:first-child td:first-child")).toContainText("Barre Foundations");
  await sortClass.press("Enter");
  await expect(table.locator("thead th:first-child")).toHaveAttribute("aria-sort", "descending");
  await sortClass.press("Enter");
  await expect(table.locator("thead th:first-child")).toHaveAttribute("aria-sort", "none");
  await expect(parents.nth(1)).toContainText("Reformer Pilates");

  await page.getByRole("combobox", { name: "Rows per page" }).selectOption("25");
  expect(await parents.count()).toBe(12);
  await expect(page.getByRole("button", { name: "Next page" })).toBeDisabled();
  await page.getByRole("combobox", { name: "Rows per page" }).selectOption("10");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  const attendeeMode = page.getByRole("combobox", { name: "Attendee loading" });
  await attendeeMode.focus();
  await attendeeMode.press("ArrowDown");
  await attendeeMode.press("Enter");
  await expect(attendeeMode).toHaveValue("lazy");
  await expandYoga.click();
  await expect(page.getByText("Loading details…", { exact: true })).toBeVisible();
  await expect(attendees).toBeVisible();
  await expect(attendees.getByRole("cell", { name: "Jamie Tan", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Collapse Yoga Flow attendees" }).click();
  await expandYoga.click();
  await expect(attendees).toBeVisible();
  await expect(page.getByText("Loading details…", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Expand Barre Foundations attendees" }).click();
  await expect(page.getByText("No attendees", { exact: true })).toBeVisible();
  await attendeeMode.selectOption("inline");
  await expect(expandYoga).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByText("Page 1 of 2")).toBeVisible();
  await expandYoga.click();
  await expect(attendees).toBeVisible();
  await page.getByRole("button", { name: "Collapse Yoga Flow attendees" }).click();

  if ((page.viewportSize()?.width ?? 0) < 600) {
    const region = page.getByRole("region", { name: "Class timetable, scrollable table" });
    const pinnedCell = parents.first().locator(":scope > td").first();
    const before = await pinnedCell.boundingBox();
    await region.focus();
    await region.press("ArrowRight");
    await expect.poll(() => region.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
    await expect(region).toHaveAttribute("data-scrolled", "true");
    await expect(pinnedCell).toHaveCSS("position", "sticky");
    await expect(pinnedCell).not.toHaveCSS("box-shadow", "none");
    const after = await pinnedCell.boundingBox();
    expect(Math.abs((after?.x ?? -100) - (before?.x ?? 100))).toBeLessThan(1);
    await region.evaluate(element => { element.scrollLeft = 0; });
  }

  expect(errors).toEqual([]);
  await expandYoga.click();
  const currentPanelId = await page.getByRole("button", { name: "Collapse Yoga Flow attendees" }).getAttribute("aria-controls");
  const currentPanel = page.locator(`[id="${currentPanelId}"]`);
  await expect.poll(() => currentPanel.evaluate(element => element.getBoundingClientRect().height)).toBeGreaterThan(100);
  await expect.poll(() => currentPanel.evaluate(element => Math.abs(element.getBoundingClientRect().height - element.firstElementChild!.getBoundingClientRect().height))).toBeLessThan(2);
  await page.screenshot({ path: testInfo.outputPath("timetable.png"), fullPage: true });
});
