export type Anchor = {
  /** The trigger's box in viewport coordinates, as getBoundingClientRect gives it. */
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
};

export type Placement = {
  top: number;
  left?: number;
  right?: number;
};

/** Breathing room kept between the panel and the window edge. */
export const EDGE_PADDING = 16;
/** Gap between the trigger and the panel below it. */
export const TRIGGER_GAP = 4;

/**
 * Where the panel goes, in viewport coordinates.
 *
 * The panel is positioned `fixed`, which means these coordinates stop being
 * true the moment the page scrolls: the panel stays welded to the window while
 * the trigger slides away, and the options appear to drift across the results.
 * So this is not a one-shot calculation done when the menu opens — the caller
 * runs it again on every scroll and resize, and it is pure so that it can be.
 */
export const dropdownPosition = (
  anchor: Anchor,
  panelWidth: number,
  viewportWidth: number,
): Placement => {
  const top = anchor.bottom + TRIGGER_GAP;

  // Left edge of the panel under the left edge of the trigger, when it fits.
  // Clamped, because a scroll can drag the trigger past the window edge and
  // aligning to it there would take the panel off screen with it.
  const left = Math.max(anchor.left, EDGE_PADDING);
  if (left + panelWidth + EDGE_PADDING <= viewportWidth) {
    return { top, left };
  }

  // Otherwise line the right edges up, clamped for the same reason, as long as
  // the panel's far edge still lands on screen.
  const right = Math.max(viewportWidth - anchor.right, EDGE_PADDING);
  if (viewportWidth - right - panelWidth >= EDGE_PADDING) {
    return { top, right };
  }

  // Too wide for either: pin it to the right margin.
  return { top, right: EDGE_PADDING };
};

/**
 * Whether the trigger has scrolled out of the window. Following it past the
 * edge would leave the panel floating against a trigger nobody can see, so the
 * caller closes instead.
 */
export const anchorIsOffscreen = (
  anchor: Anchor,
  viewportHeight: number,
): boolean => anchor.bottom < 0 || anchor.top > viewportHeight;
