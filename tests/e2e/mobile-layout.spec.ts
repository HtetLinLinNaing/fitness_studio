import { expect, test } from "@playwright/test";

for (const width of [320, 375]) {
  for (const [route, caption] of [
    ["/classTimetable", "Class timetable"],
    ["/inventory", "Studio inventory"],
  ]) {
    test(`${caption} leaves room beside the pinned column at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 812 });
      await page.goto(route);
      const table = page.getByRole("table", { name: caption, exact: true });
      await expect(table).toHaveAttribute("aria-busy", "false");
      const region = page.getByRole("region", { name: `${caption}, scrollable table` });
      const row = table.locator(":scope > tbody > tr[data-parent-row]").first();
      const pinned = row.locator(":scope > td").first();
      const regionBox = (await region.boundingBox())!;
      const before = (await pinned.boundingBox())!;

      // Leave enough space to read scrolling content alongside the class/item name.
      expect(regionBox.width - before.width).toBeGreaterThanOrEqual(110);
      await region.evaluate(element => { element.scrollLeft = 200; });
      await expect.poll(() => region.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
      const after = (await pinned.boundingBox())!;
      expect(Math.abs(after.x - before.x)).toBeLessThan(1);
      await expect(pinned).not.toHaveCSS("box-shadow", "none");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

      await region.evaluate(element => { element.scrollLeft = 0; });
      await row.getByRole("button").click();
      await expect(row.getByRole("button")).toHaveAttribute("aria-expanded", "true");
      await expect(table.locator(":scope > tbody > tr[data-detail-row]").first()).toBeVisible();
    });
  }
}
