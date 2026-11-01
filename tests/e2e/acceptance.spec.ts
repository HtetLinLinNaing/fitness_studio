import { expect, test } from "@playwright/test";

test("shared layout keeps navigation and the skip link correct across routes", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/classTimetable$/);
  const navigation = page.getByRole("navigation", { name: "Main navigation" });
  const timetable = navigation.getByRole("link", { name: "Class timetable" });
  const inventory = navigation.getByRole("link", { name: "Inventory" });
  const skipLink = page.getByRole("link", { name: "Skip to main content" });

  await expect(timetable).toHaveAttribute("aria-current", "page");
  await expect(timetable).toHaveAttribute("href", "/classTimetable");
  await expect(inventory).toHaveAttribute("href", "/inventory");
  await expect(inventory).not.toHaveAttribute("aria-current");
  await expect(skipLink).toHaveAttribute("href", "#main-content");

  await inventory.click();
  await expect(page).toHaveURL(/\/inventory$/);
  await expect(inventory).toHaveAttribute("aria-current", "page");
  await expect(timetable).not.toHaveAttribute("aria-current");
  await expect(page.getByRole("main")).toHaveAttribute("id", "main-content");
  await expect(page.getByRole("banner")).toHaveCount(1);

  await timetable.click();
  await expect(
    page.getByRole("heading", { name: "Class timetable", exact: true }),
  ).toBeVisible();
  await expect(timetable).toHaveAttribute("aria-current", "page");
  await expect(inventory).not.toHaveAttribute("aria-current");
  await skipLink.focus();
  await skipLink.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
  await expect(page.getByRole("main")).toHaveCount(1);
});

test("tablet pages expose labeled semantic tables and responsive client interactions", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop-chromium",
    "Tablet verification runs once.",
  );
  await page.setViewportSize({ width: 768, height: 1024 });
  for (const [route, caption] of [
    ["/classTimetable", "Class timetable"],
    ["/inventory", "Studio inventory"],
  ]) {
    await page.goto(route);
    const table = page.getByRole("table", { name: caption, exact: true });
    await expect(table).toHaveAttribute("aria-busy", "false");
    await expect(page.getByRole("main")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(
      page
        .getByRole("navigation", { name: "Main navigation" })
        .locator('[aria-current="page"]'),
    ).toHaveCount(1);
    const headers = table.locator(":scope > thead > tr > th");
    for (const header of await headers.all())
      await expect(header).toHaveAttribute("scope", "col");
    for (const select of await page.getByRole("combobox").all())
      await expect(select).toHaveAccessibleName(/.+/);
    for (const button of await page.getByRole("button").all())
      await expect(button).toHaveAccessibleName(/.+/);
    const toggle = table
      .locator(":scope > tbody > tr[data-parent-row]")
      .first()
      .getByRole("button");
    await toggle.focus();
    await toggle.press("Enter");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    const panelId = await toggle.getAttribute("aria-controls");
    await expect(page.locator(`[id="${panelId}"]`)).not.toHaveAttribute(
      "inert",
    );
    const collapse = table.getByRole("button", { name: /^Collapse / }).first();
    await collapse.press("Enter");
    await expect(page.locator(`[id="${panelId}"]`)).toHaveAttribute(
      "inert",
      "",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(
        `${route === "/classTimetable" ? "timetable" : "inventory"}-tablet.png`,
      ),
      fullPage: true,
    });
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  const sort = page.getByRole("button", { name: /^Sort by Unit price,/ });
  const timings: number[] = [];
  for (let index = 0; index < 6; index++) {
    // Includes the event, React commit and two animation frames; excludes tool transport and mock latency.
    timings.push(
      await sort.evaluate(
        (element) =>
          new Promise<number>((resolve) => {
            const start = performance.now();
            (element as HTMLButtonElement).click();
            requestAnimationFrame(() =>
              requestAnimationFrame(() => resolve(performance.now() - start)),
            );
          }),
      ),
    );
  }
  await expect(
    page
      .getByRole("table", { name: "Studio inventory", exact: true })
      .locator(":scope > tbody > tr[data-parent-row]"),
  ).toHaveCount(10);
  await testInfo.attach("client-sort-timings", {
    body: JSON.stringify({
      rows: 100,
      viewport: "1440x900",
      samplesMs: timings,
    }),
    contentType: "application/json",
  });
});
