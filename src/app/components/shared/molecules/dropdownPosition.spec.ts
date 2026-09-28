import { describe, expect, it } from "vitest";
import {
  anchorIsOffscreen,
  dropdownPosition,
  EDGE_PADDING,
  TRIGGER_GAP,
} from "./dropdownPosition";
import type { Anchor } from "./dropdownPosition";

/**
 * The bug these exist for: the panel is `fixed`, so coordinates taken when it
 * opened stop being true the moment the page scrolls. The panel stayed welded
 * to the window while the trigger slid away, and the options drifted across
 * the results. The fix is to re-anchor on every scroll, which only works if
 * this function answers from the trigger's *current* box — so most of what
 * follows is checking it never carries anything over from a previous call.
 */
const anchor = (over: Partial<Anchor> = {}): Anchor => {
  const left = over.left ?? 100;
  const width = over.width ?? 120;
  const top = over.top ?? 200;
  return {
    top,
    bottom: over.bottom ?? top + 40,
    left,
    right: over.right ?? left + width,
    width,
  };
};

describe("dropdownPosition", () => {
  it("sits just under the trigger", () => {
    const place = dropdownPosition(anchor({ top: 200 }), 200, 1280);
    expect(place.top).toBe(240 + TRIGGER_GAP);
  });

  it("lines its left edge up with the trigger when it fits", () => {
    const place = dropdownPosition(anchor({ left: 100 }), 200, 1280);
    expect(place.left).toBe(100);
    expect(place.right).toBeUndefined();
  });

  it("flips to the right edge when the panel would overflow", () => {
    // Trigger near the right edge, wide panel: left-aligning would push it off
    // screen, so the right edges line up instead.
    const place = dropdownPosition(
      anchor({ left: 1100, width: 120 }),
      400,
      1280,
    );
    expect(place.left).toBeUndefined();
    expect(place.right).toBe(1280 - 1220);
  });

  it("pins to the margin when the panel fits neither way", () => {
    const place = dropdownPosition(anchor({ left: 10, width: 60 }), 1400, 1280);
    expect(place.right).toBe(EDGE_PADDING);
  });

  describe("following the trigger as the page scrolls", () => {
    it("moves up by exactly what the trigger moved", () => {
      // This is the whole fix: same trigger, scrolled 300px, and the panel has
      // to have travelled the same 300px rather than staying where it opened.
      const before = dropdownPosition(anchor({ top: 500 }), 200, 1280);
      const after = dropdownPosition(anchor({ top: 200 }), 200, 1280);
      expect(before.top - after.top).toBe(300);
    });

    it("tracks sideways scrolling too", () => {
      const before = dropdownPosition(anchor({ left: 400 }), 200, 1280);
      const after = dropdownPosition(anchor({ left: 250 }), 200, 1280);
      expect(before.left! - after.left!).toBe(150);
    });

    it("gives the same answer for the same box, every time", () => {
      // No memory between calls: a stale value is what left the panel behind.
      const box = anchor({ top: 320, left: 64 });
      const first = dropdownPosition(box, 200, 1280);
      dropdownPosition(anchor({ top: 900, left: 900 }), 200, 1280);
      expect(dropdownPosition(box, 200, 1280)).toEqual(first);
    });

    it("re-flips when the scroll changes which side fits", () => {
      // A horizontal scroll can turn a left-aligned panel into one that no
      // longer fits; it has to notice rather than keep the old side.
      const roomy = dropdownPosition(anchor({ left: 100 }), 400, 1280);
      const tight = dropdownPosition(
        anchor({ left: 1000, width: 120 }),
        400,
        1280,
      );
      expect(roomy.left).toBe(100);
      expect(tight.left).toBeUndefined();
    });
  });

  describe("what must never happen", () => {
    it("never leaves the panel hanging off the right edge", () => {
      // Sweep the trigger across the window; the panel's right edge must stay
      // inside it at every step.
      for (let left = 0; left <= 1280; left += 40) {
        const place = dropdownPosition(anchor({ left, width: 120 }), 360, 1280);
        const rightEdge =
          place.left !== undefined ? place.left + 360 : 1280 - place.right!;
        expect(rightEdge).toBeLessThanOrEqual(1280);
      }
    });

    it("never leaves the panel hanging off the left edge", () => {
      for (let left = 0; left <= 1280; left += 40) {
        const place = dropdownPosition(anchor({ left, width: 120 }), 360, 1280);
        const leftEdge =
          place.left !== undefined ? place.left : 1280 - place.right! - 360;
        expect(leftEdge).toBeGreaterThanOrEqual(0);
      }
    });

    it("never overlaps the trigger it belongs to", () => {
      const box = anchor({ top: 100, bottom: 140 });
      expect(dropdownPosition(box, 200, 1280).top).toBeGreaterThan(box.bottom);
    });

    it("never returns both a left and a right", () => {
      // Setting both would stretch the panel across the window instead of
      // placing it.
      for (const left of [0, 200, 600, 1100, 1279]) {
        const place = dropdownPosition(anchor({ left }), 300, 1280);
        expect(place.left === undefined || place.right === undefined).toBe(true);
      }
    });

    it("stays on screen in a narrow window", () => {
      const place = dropdownPosition(anchor({ left: 8, width: 100 }), 400, 375);
      expect(place.right).toBe(EDGE_PADDING);
    });

    it("does not follow a trigger that scrolled past the left edge", () => {
      // A sideways scroll can drag the trigger to a negative left. Aligning to
      // it would take the panel off screen along with it.
      const place = dropdownPosition(
        anchor({ left: -200, width: 120 }),
        300,
        1280,
      );
      expect(place.left).toBe(EDGE_PADDING);
    });

    it("does not follow a trigger that scrolled past the right edge", () => {
      const place = dropdownPosition(
        anchor({ left: 1200, width: 120 }),
        360,
        1280,
      );
      const rightEdge = 1280 - place.right!;
      expect(rightEdge).toBeLessThanOrEqual(1280);
      expect(place.right).toBeGreaterThanOrEqual(EDGE_PADDING);
    });
  });
});

describe("anchorIsOffscreen", () => {
  it("is false while the trigger is in view", () => {
    expect(anchorIsOffscreen(anchor({ top: 100, bottom: 140 }), 800)).toBe(
      false,
    );
  });

  it("is true once the trigger has scrolled off the top", () => {
    // Following it up there would leave the panel floating against a trigger
    // nobody can see, so the caller closes instead.
    expect(anchorIsOffscreen(anchor({ top: -60, bottom: -20 }), 800)).toBe(true);
  });

  it("is true once the trigger has scrolled off the bottom", () => {
    expect(anchorIsOffscreen(anchor({ top: 900, bottom: 940 }), 800)).toBe(true);
  });

  it("is false while any part of the trigger is still showing", () => {
    // Closing on the first pixel of movement would make the menu feel broken.
    expect(anchorIsOffscreen(anchor({ top: -20, bottom: 10 }), 800)).toBe(false);
    expect(anchorIsOffscreen(anchor({ top: 790, bottom: 830 }), 800)).toBe(
      false,
    );
  });
});
