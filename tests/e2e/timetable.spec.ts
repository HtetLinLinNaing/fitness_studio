import { expect, test } from "@playwright/test";

test("timetable renders real classes and keeps the class column pinned on narrow screens", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");

  await expect(page).toHaveTitle("HL Fitness Studio | Class timetable");
  await expect(page.getByRole("heading", { name: "Class timetable", exact: true })).toBeVisible();
  const table = page.getByRole("table", { name: "Class timetable", exact: true });
  await expect(table).toHaveAttribute("aria-busy", "false");
  await expect(table.getByRole("cell", { name: "Yoga Flow 60 min class" })).toBeVisible();
  expect(await table.locator("tbody > tr").count()).toBe(10);
  await expect(page.getByText("Page 1 of 2")).toBeVisible();
  await page.getByRole("button", { name: "Next page" }).click();
  await expect(table.getByRole("cell", { name: "Evening Reset 45 min class" })).toBeVisible();
  expect(await table.locator("tbody > tr").count()).toBe(2);
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
  await expect(table.locator("tbody tr:nth-child(2) td:first-child")).toContainText("Reformer Pilates");

  await page.getByRole("combobox", { name: "Rows per page" }).selectOption("25");
  expect(await table.locator("tbody > tr").count()).toBe(12);
  await expect(page.getByRole("button", { name: "Next page" })).toBeDisabled();
  await page.getByRole("combobox", { name: "Rows per page" }).selectOption("10");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  if ((page.viewportSize()?.width ?? 0) < 600) {
    const region = page.getByRole("region", { name: "Class timetable, scrollable table" });
    const pinnedCell = table.locator("tbody > tr:first-child > td:first-child");
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
  await page.screenshot({ path: testInfo.outputPath("timetable.png"), fullPage: true });
});
