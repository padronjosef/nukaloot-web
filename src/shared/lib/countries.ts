const DISPLAY = new Intl.DisplayNames(["en"], { type: "region" });

/** "AR" -> "Argentina". Falls back to the code itself for anything unknown. */
export const countryName = (code: string | null): string => {
  if (!code) return "Unknown";
  try {
    return DISPLAY.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
};

/** "AR" -> "🇦🇷", built from regional indicator symbols, no image assets needed. */
export const countryFlag = (code: string | null): string => {
  if (!code || code.length !== 2 || !/^[a-z]{2}$/i.test(code)) return "🌐";
  return String.fromCodePoint(
    ...code
      .toUpperCase()
      .split("")
      .map((c) => 0x1f1e6 - 65 + c.charCodeAt(0)),
  );
};
