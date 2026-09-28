export type AnalyticsRange = "24h" | "7d" | "30d" | "all";

export type AnalyticsOverview = {
  searches: number;
  visitors: number;
  ips: number;
  uniqueQueries: number;
  countries: number;
  signedInUsers: number;
  signedInSearches: number;
  cacheHits: number;
  cacheHitRate: number;
  botSearches: number;
};

export type TopQuery = {
  query: string;
  normalizedQuery: string;
  count: number;
  visitors: number;
  lastSearchedAt: string;
};

export type CountryRow = {
  country: string | null;
  count: number;
  visitors: number;
};

export type VisitorKind = "registered" | "anonymous" | "bots";

export type TimelineValue = { count: number; visitors: number };

export type TimelinePoint = { bucket: string } & Record<
  VisitorKind,
  TimelineValue
>;

/**
 * Validated against the dark surface for colour-vision deficiency; bots also
 * get a dashed stroke so the three never rely on colour alone.
 */
export const KIND_STYLE: Record<
  VisitorKind,
  { label: string; color: string; dashed?: boolean }
> = {
  registered: { label: "Signed in", color: "#16a34a" },
  anonymous: { label: "Anonymous", color: "#3b82f6" },
  bots: { label: "Bots", color: "#d97706", dashed: true },
};

export type TopVisitor = {
  visitorId: string;
  ip: string | null;
  country: string | null;
  city: string | null;
  count: number;
  lastSeenAt: string;
  userAgent: string | null;
  userEmail: string | null;
  userName: string | null;
};

export type AnalyticsSummary = {
  range: AnalyticsRange;
  includeBots: boolean;
  overview: AnalyticsOverview;
  topQueries: TopQuery[];
  byCountry: CountryRow[];
  timeline: TimelinePoint[];
  topVisitors: TopVisitor[];
};

export type SearchLogRow = {
  id: string;
  query: string;
  normalizedQuery: string;
  ip: string | null;
  country: string | null;
  city: string | null;
  region: string | null;
  currencyRegion: string | null;
  userAgent: string | null;
  referer: string | null;
  isBot: boolean;
  cacheHit: boolean;
  resultCount: number;
  visitorId: string | null;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  createdAt: string;
};

export const RANGE_LABELS: Record<AnalyticsRange, string> = {
  "24h": "Last 24 hours",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  all: "All time",
};
