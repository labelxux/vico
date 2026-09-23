// Accessibility regression suite — SI 5568 Part 1 / WCAG 2.0 AA.
// Fails on any serious/critical axe violation, plus targeted checks for issues
// axe can't see (skip link, landmarks, wine table, motion, reflow, keyboard).
const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;

const PAGES = [
  { path: "/", lang: "he" },
  { path: "/menu/", lang: "he" },
  { path: "/jobs/", lang: "he" },
  { path: "/accessibility/", lang: "he" },
  { path: "/en/", lang: "en" },
  { path: "/en/menu/", lang: "en" },
  { path: "/en/jobs/", lang: "en" },
];

test.beforeEach(async ({ page }) => {
  await page.route(/googletagmanager\.com|google-analytics\.com/, (r) => r.abort());
});

for (const { path, lang } of PAGES) {
  test.describe(path, () => {
    test("no serious or critical axe violations (WCAG 2.0 A/AA)", async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
      const blocking = results.violations.filter((v) => ["serious", "critical"].includes(v.impact));
      const summary = blocking.map((v) => `${v.impact} ${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 5).join(", ")}`);
      expect(summary, "serious/critical axe violations").toEqual([]);
    });

    test("document language, direction and title", async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
      await expect(page.locator("html")).toHaveAttribute("dir", lang === "he" ? "rtl" : "ltr");
      expect((await page.title()).length).toBeGreaterThan(10);
    });

    test("one H1, inside <main id=main-content>; header/nav/footer landmarks", async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("main#main-content")).toHaveCount(1);
      await expect(page.locator("main#main-content h1")).toHaveCount(1);
      await expect(page.locator("header.site-header")).toHaveCount(1);
      await expect(page.locator("footer")).toHaveCount(1);
      for (const nav of await page.locator("nav").all()) {
        expect(await nav.getAttribute("aria-label"), "every <nav> is labelled").toBeTruthy();
      }
    });

    test("skip link is the first Tab stop, visible on focus, and moves focus to main", async ({ page }) => {
      await page.goto(path);
      await page.keyboard.press("Tab");
      const skip = page.locator(".skip-link");
      await expect(skip).toBeFocused();
      await expect(skip).toHaveAttribute("href", "#main-content");
      const box = await skip.boundingBox();
      expect(box && box.y >= 0 && box.height > 0, "skip link on screen when focused").toBeTruthy();
      await page.keyboard.press("Enter");
      await expect(page.locator("#main-content")).toBeFocused();
    });

    test("no positive tabindex; images have alt; alt is never a filename", async ({ page }) => {
      await page.goto(path);
      expect(await page.locator("[tabindex]:not([tabindex='0']):not([tabindex^='-'])").count()).toBe(0);
      const bad = await page.$$eval("img", (imgs) =>
        imgs.filter((i) => !i.hasAttribute("alt") || /\.(jpe?g|png|svg|webp|gif)$/i.test(i.alt)).map((i) => i.src));
      expect(bad).toEqual([]);
    });

    test("accessibility statement link is a real, reachable <a> in the footer", async ({ page }) => {
      await page.goto(path);
      const link = page.locator('footer a[href="/accessibility/"]');
      await expect(link).toHaveCount(1);
      await link.focus();
      await expect(link).toBeFocused();
    });
  });
}

test.describe("menu page", () => {
  test("category links point at unique, existing section ids", async ({ page }) => {
    await page.goto("/menu/");
    const hrefs = await page.$$eval(".catnav a", (as) => as.map((a) => a.getAttribute("href")));
    expect(hrefs.length).toBeGreaterThan(5);
    for (const h of hrefs) {
      expect(h.startsWith("#")).toBeTruthy();
      await expect(page.locator(`[id="${h.slice(1)}"]`)).toHaveCount(1);
    }
  });

  test("wine prices are a data table with caption, column and row headers", async ({ page }) => {
    await page.goto("/menu/");
    const table = page.locator("table.wine");
    await expect(table.locator("caption")).toHaveCount(1);
    await expect(table.locator('thead th[scope="col"]')).toHaveCount(3);
    const rows = table.locator("tbody tr:not(.wine__group)");
    const n = await rows.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      await expect(rows.nth(i).locator('th[scope="row"]')).toHaveCount(1);
      await expect(rows.nth(i).locator("td")).toHaveCount(2);
    }
    // empty glass price is announced, not silent
    const empty = await table.locator("td").evaluateAll((tds) => tds.filter((td) => !td.textContent.trim()).length);
    expect(empty).toBe(0);
  });

  test("heading levels never skip", async ({ page }) => {
    await page.goto("/menu/");
    const levels = await page.$$eval("main h1, main h2, main h3, main h4, main h5, main h6", (hs) => hs.map((h) => +h.tagName[1]));
    for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
  });
});

test.describe("home page", () => {
  test("gallery motion can be paused from the keyboard (WCAG 2.2.2)", async ({ page }) => {
    await page.goto("/");
    const toggle = page.locator(".carousel__toggle");
    await expect(toggle).toBeVisible();
    await toggle.focus();
    await page.keyboard.press("Enter");
    const track = page.locator(".carousel__track");
    const a = await track.evaluate((el) => el.style.transform);
    await page.waitForTimeout(600);
    expect(await track.evaluate((el) => el.style.transform)).toBe(a);
    await page.keyboard.press("Space");
    await page.waitForTimeout(600);
    expect(await track.evaluate((el) => el.style.transform)).not.toBe(a);
  });

  test("reduced motion: gallery doesn't auto-scroll", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.locator(".carousel")).toHaveClass(/is-scrollable/);
    await expect(page.locator(".carousel__toggle")).toBeHidden();
    await ctx.close();
  });

  test("heading levels never skip", async ({ page }) => {
    await page.goto("/");
    const levels = await page.$$eval("main h1, main h2, main h3, main h4", (hs) => hs.map((h) => +h.tagName[1]));
    for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
  });
});

test.describe("mobile header", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("hidden mobile action bar is not focusable while the hero is on screen", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".site-mobilebar")).toHaveClass(/is-hidden/);
    expect(await page.locator(".site-mobilebar").evaluate((el) => el.inert)).toBe(true);
  });

  test("drawer: button exposes state; Esc closes it and returns focus", async ({ page }) => {
    await page.goto("/menu/");
    const burger = page.locator("[data-burger]");
    await expect(burger).toHaveAttribute("aria-controls", "site-drawer");
    await burger.focus();
    await page.keyboard.press("Enter");
    await expect(burger).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#site-drawer")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#site-drawer")).toBeHidden();
    await expect(burger).toBeFocused();
  });
});

test.describe("reflow (400% zoom ≈ 320×256 CSS px)", () => {
  test.use({ viewport: { width: 320, height: 256 } });
  for (const path of ["/", "/menu/", "/accessibility/"]) {
    test(`${path}: no horizontal scrolling`, async ({ page }) => {
      await page.goto(path);
      const [sw, cw] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
      expect(sw).toBeLessThanOrEqual(cw);
    });
  }
});
