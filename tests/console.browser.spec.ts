import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { chromium } from "playwright";
import type { Browser, ConsoleMessage, Page } from "playwright";

/**
 * The console guard.
 *
 * Nothing may reach the browser console — no error, no warning. This runs a
 * real browser against the running app, because that is the only place the
 * answer is true: a hydration mismatch, a bad image prop or a failed request
 * shows up here and nowhere in a unit test.
 *
 * One case deliberately mimics a browser extension editing the DOM before
 * React hydrates, which is what Dark Reader does and what caused the error
 * this file exists because of.
 */

// Not named APP_URL: Vite reserves that one and hands it the app's base
// path, so it is always "/" here no matter what the environment says.
// `||`, not `??`, so an empty value falls through to the default too.
const APP_URL = process.env.NUKALOOT_URL || "http://localhost:3003";

/**
 * Next's own development chatter. These are `log`/`info`, never error or
 * warning, and they do not exist in a production build — but they are listed
 * so the filter below is a decision rather than an accident.
 */
const DEV_NOISE = [
  "[HMR]",
  "[Fast Refresh]",
  "Download the React DevTools",
];

const isNoise = (text: string) =>
  DEV_NOISE.some((fragment) => text.includes(fragment));

/** Collects everything the page complains about, for one navigation. */
const watchConsole = (page: Page) => {
  const complaints: string[] = [];

  page.on("console", (msg: ConsoleMessage) => {
    const type = msg.type();
    if (type !== "error" && type !== "warning") return;
    const text = msg.text();
    if (isNoise(text)) return;
    complaints.push(`[${type}] ${text}`);
  });

  // An uncaught exception never reaches page.on("console") in every browser,
  // and it is the loudest failure of all.
  page.on("pageerror", (error) => {
    complaints.push(`[pageerror] ${error.message}`);
  });

  // A request that dies is a broken feature even when nothing is logged.
  page.on("requestfailed", (request) => {
    const failure = request.failure()?.errorText ?? "";
    // Aborted requests are normal: React cancels in-flight fetches on unmount.
    if (failure.includes("ERR_ABORTED")) return;
    complaints.push(`[requestfailed] ${request.url()} — ${failure}`);
  });

  return complaints;
};

/** Mimics Dark Reader: attributes and a style tag, before any page script. */
const pretendAnExtensionIsInstalled = (page: Page) =>
  page.addInitScript(() => {
    // This runs before any page script, when <html> may not exist yet.
    // Registering the listeners first matters: throwing here would kill the
    // whole simulation and leave the test passing for the wrong reason.
    const paint = () => {
      try {
        document.documentElement?.setAttribute(
          "data-darkreader-proxy-injected",
          "true",
        );
        document.documentElement?.setAttribute(
          "data-darkreader-mode",
          "dynamic",
        );
        document.body?.setAttribute("data-darkreader-body", "true");
        if (document.head && !document.head.querySelector("style.darkreader")) {
          const style = document.createElement("style");
          style.className = "darkreader darkreader--fallback";
          style.textContent = "html { background: #181a1b; }";
          document.head.appendChild(style);
        }
      } catch {
        // Nothing to do; the assertion in the test is what reports it.
      }
    };

    document.addEventListener("readystatechange", paint);
    document.addEventListener("DOMContentLoaded", paint);
    paint();
  });

const settle = (page: Page) => page.waitForTimeout(2500);

/**
 * The home page leads with its own big search box ("What are you looting
 * today?") and the header carries a second one ("Hunt for loot"), rendered
 * twice more for desktop and mobile — so most copies are hidden at any moment.
 * Matching both wordings and filtering to what is visible is what keeps this
 * from timing out on an element nobody can type into.
 */
const searchBox = (page: Page) =>
  page
    .getByPlaceholder(/looting today|hunt for loot/i)
    .locator("visible=true")
    .first();

const search = async (page: Page, query: string) => {
  await searchBox(page).fill(query);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(8000);
};

describe("browser console", () => {
  let browser: Browser;

  beforeAll(async () => {
    const reachable = await fetch(APP_URL)
      .then((r) => r.ok)
      .catch(() => false);

    if (!reachable) {
      // Deliberately a failure and not a skip: a guard that quietly does not
      // run is the same as no guard, and this one exists because something
      // slipped through once already.
      throw new Error(
        `Nothing is serving ${APP_URL}. Start the stack first ` +
          `(docker compose up in nukaloot-infra), or set NUKALOOT_URL.`,
      );
    }

    browser = await chromium.launch();
  }, 60_000);

  afterAll(async () => {
    await browser?.close();
  });

  it("says nothing on the home page", async () => {
    const page = await browser.newPage();
    const complaints = watchConsole(page);

    await page.goto(APP_URL, { waitUntil: "networkidle" });
    await settle(page);
    await page.close();

    expect(complaints).toEqual([]);
  }, 60_000);

  it("says nothing after a search", async () => {
    const page = await browser.newPage();
    const complaints = watchConsole(page);

    await page.goto(APP_URL, { waitUntil: "networkidle" });
    await search(page, "dark souls 3");
    await page.close();

    expect(complaints).toEqual([]);
  }, 90_000);

  it("says nothing with the platform menu open and the page scrolling", async () => {
    // The menu re-anchors itself every frame while open; a throw in there
    // would land in the console rather than break the page visibly.
    const page = await browser.newPage();
    const complaints = watchConsole(page);

    await page.goto(APP_URL, { waitUntil: "networkidle" });
    await search(page, "dark souls 3");

    const platforms = page.getByRole("button", { name: /^PC/ }).first();
    if (await platforms.isVisible().catch(() => false)) {
      await platforms.click();
      await page.mouse.wheel(0, 400);
      await page.waitForTimeout(600);
      await page.mouse.wheel(0, -400);
      await page.waitForTimeout(600);
    }

    await page.close();
    expect(complaints).toEqual([]);
  }, 90_000);

  it("says nothing when an extension edits the DOM before React hydrates", async () => {
    // The regression this file was written for. Dark Reader puts attributes
    // on <html> and <body> and a style tag in <head> before any page script
    // runs, and React reported a hydration mismatch nobody could act on.
    const page = await browser.newPage();
    await pretendAnExtensionIsInstalled(page);
    const complaints = watchConsole(page);

    await page.goto(APP_URL, { waitUntil: "networkidle" });
    await settle(page);

    const applied = await page.evaluate(() =>
      document.documentElement.getAttribute("data-darkreader-proxy-injected"),
    );
    await page.close();

    // If the simulation stopped working the test would pass for the wrong
    // reason, so it has to prove the attribute was actually there.
    expect(applied).toBe("true");
    expect(complaints).toEqual([]);
  }, 60_000);

  it("survives an extension that rewrites elements inside the app", async () => {
    // Dark Reader's dynamic mode does not stop at <html>: it puts
    // data-darkreader-inline-* on elements throughout the page. Nothing here
    // can prevent that — `suppressHydrationWarning` reaches one element and
    // its own attributes, not a whole tree, and suppressing it everywhere
    // would hide the mismatches that are our fault.
    //
    // Measured: a production build says nothing at all, so nobody using the
    // site ever sees it. A development build reports the mismatch and that is
    // the only thing it is allowed to report — anything else means we broke
    // something, which is what this asserts.
    const page = await browser.newPage();
    await page.addInitScript(() => {
      const paint = () => {
        try {
          document.documentElement?.setAttribute(
            "data-darkreader-proxy-injected",
            "true",
          );
          document
            .querySelectorAll("div,span,header,main,button")
            .forEach((el, i) => {
              if (i < 30) el.setAttribute("data-darkreader-inline-bgcolor", "");
            });
        } catch {
          // The assertion below is what reports a broken simulation.
        }
      };
      document.addEventListener("readystatechange", paint);
      document.addEventListener("DOMContentLoaded", paint);
      paint();
    });
    const complaints = watchConsole(page);

    await page.goto(APP_URL, { waitUntil: "networkidle" });
    await settle(page);

    const touched = await page.evaluate(
      () => document.querySelectorAll("[data-darkreader-inline-bgcolor]").length,
    );
    await page.close();

    // Proves the simulation ran, so a pass cannot come from doing nothing.
    expect(touched).toBeGreaterThan(0);

    const unexpected = complaints.filter(
      (c) => !c.includes("A tree hydrated but some attributes"),
    );
    expect(unexpected).toEqual([]);
  }, 60_000);

  describe("the guard itself", () => {
    it("fails when the page does complain", async () => {
      // Without this, a broken collector would make every test above pass
      // forever and nobody would know.
      const page = await browser.newPage();
      const complaints = watchConsole(page);

      await page.goto(APP_URL, { waitUntil: "networkidle" });
      await page.evaluate(() => console.error("deliberate canary"));
      await page.waitForTimeout(300);
      await page.close();

      expect(complaints).toEqual(["[error] deliberate canary"]);
    }, 60_000);

    it("notices an uncaught exception too", async () => {
      const page = await browser.newPage();
      const complaints = watchConsole(page);

      await page.goto(APP_URL, { waitUntil: "networkidle" });
      await page.evaluate(() => {
        setTimeout(() => {
          throw new Error("deliberate explosion");
        }, 0);
      });
      await page.waitForTimeout(300);
      await page.close();

      expect(complaints.join("\n")).toContain("deliberate explosion");
    }, 60_000);

    it("does not count Next's own development logging as a complaint", async () => {
      // If it did, the guard would be red on every run and get ignored.
      const page = await browser.newPage();
      const complaints = watchConsole(page);

      await page.goto(APP_URL, { waitUntil: "networkidle" });
      await page.evaluate(() => {
        console.log("[HMR] connected");
        console.info("Download the React DevTools for a better experience");
      });
      await page.waitForTimeout(300);
      await page.close();

      expect(complaints).toEqual([]);
    }, 60_000);
  });
});
