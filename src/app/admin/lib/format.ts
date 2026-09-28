const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["second", 60],
  ["minute", 60],
  ["hour", 24],
  ["day", 7],
  ["week", 4.35],
  ["month", 12],
  ["year", Infinity],
];

const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

export const relativeTime = (iso: string | Date): string => {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  let delta = (date.getTime() - Date.now()) / 1000;

  for (const [unit, span] of UNITS) {
    if (Math.abs(delta) < span) return rtf.format(Math.round(delta), unit);
    delta /= span;
  }

  return date.toLocaleDateString();
};

export const absoluteTime = (iso: string | Date): string => {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const percent = (value: number): string =>
  `${Math.round(value * 100)}%`;

/**
 * Bots announce themselves in the user agent, so name the one that called
 * rather than labelling every automated hit the same. Ordered: the first
 * match wins, so the specific names come before the generic tools.
 */
const BOT_NAMES: [RegExp, string][] = [
  [/gptbot/i, "GPTBot"],
  [/oai-searchbot|chatgpt/i, "ChatGPT"],
  [/claudebot|claude-web|anthropic/i, "ClaudeBot"],
  [/perplexity/i, "PerplexityBot"],
  [/googlebot|google-inspectiontool/i, "Googlebot"],
  [/bingbot|bingpreview/i, "Bingbot"],
  [/duckduckbot/i, "DuckDuckBot"],
  [/applebot/i, "Applebot"],
  [/yandex/i, "YandexBot"],
  [/petalbot/i, "PetalBot"],
  [/bytespider/i, "Bytespider"],
  [/ahrefs/i, "AhrefsBot"],
  [/semrush/i, "SemrushBot"],
  [/mj12/i, "MJ12bot"],
  [/dotbot/i, "DotBot"],
  [/facebookexternalhit/i, "Facebook"],
  [/telegrambot/i, "Telegram"],
  [/whatsapp/i, "WhatsApp"],
  [/slackbot/i, "Slackbot"],
  [/headlesschrome/i, "Headless Chrome"],
  [/python-requests/i, "python-requests"],
  [/scrapy/i, "Scrapy"],
  [/curl\//i, "curl"],
  [/wget/i, "wget"],
  [/go-http-client/i, "Go client"],
  [/node-fetch/i, "node-fetch"],
  [/axios\//i, "axios"],
];

export const describeBot = (userAgent: string | null): string => {
  if (!userAgent) return "Bot";
  return BOT_NAMES.find(([pattern]) => pattern.test(userAgent))?.[1] ?? "Bot";
};

/**
 * Mirrors the backend's rule. The visitors table groups rows and so has no
 * isBot of its own, only the user agent it saw.
 */
export const isBot = (userAgent: string | null): boolean =>
  Boolean(userAgent) &&
  /bot|crawler|spider|crawling|slurp|bingpreview|headlesschrome|python-requests|curl\/|wget|go-http-client|axios\/|node-fetch|scrapy|facebookexternalhit|whatsapp|telegrambot|semrush|ahrefs|mj12|dotbot|petalbot|yandex|duckduckbot|applebot|gptbot|claudebot|perplexity/i.test(
    userAgent ?? "",
  );

/** Chrome 141 on Windows -> "Chrome · Windows". Good enough to eyeball a visitor. */
export const describeUserAgent = (ua: string | null): string => {
  if (!ua) return "Unknown";

  const browser =
    /edg\//i.test(ua) ? "Edge"
    : /opr\/|opera/i.test(ua) ? "Opera"
    : /chrome|crios/i.test(ua) ? "Chrome"
    : /firefox|fxios/i.test(ua) ? "Firefox"
    : /safari/i.test(ua) ? "Safari"
    : null;

  const os =
    /windows/i.test(ua) ? "Windows"
    : /iphone|ipad|ipod/i.test(ua) ? "iOS"
    : /android/i.test(ua) ? "Android"
    : /mac os x/i.test(ua) ? "macOS"
    : /linux/i.test(ua) ? "Linux"
    : null;

  if (!browser && !os) return ua.slice(0, 40);
  return [browser, os].filter(Boolean).join(" · ");
};
