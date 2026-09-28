import type { Metadata } from "next";
import { AnalyticsDashboard } from "../components/templates/AnalyticsDashboard";

export const metadata: Metadata = {
  title: "Analytics · Nuka Loot",
};

const AnalyticsPage = () => <AnalyticsDashboard />;

export default AnalyticsPage;
