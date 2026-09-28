import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Bell } from "lucide-react";
import { getSession } from "@/shared/lib/admin-api";

export const metadata: Metadata = {
  title: "Price alarms · Nuka Loot",
  robots: { index: false, follow: false },
};

const AlarmsPage = async () => {
  const session = await getSession();
  if (!session) redirect("/?signin=1&next=/account/alarms");

  return (
    <main className="relative z-10 mx-auto w-full max-w-2xl px-5 pb-16">
      <h1 className="font-heading text-xl text-foreground">Price alarms</h1>
      <p className="mb-5 text-sm text-muted-foreground">
        Get told when a game you want drops below the price you set.
      </p>

      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-6 py-12 text-center">
        <Bell className="size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground italic">
          Alarms are not built yet — this is where they will live.
        </p>
      </div>
    </main>
  );
};

export default AlarmsPage;
