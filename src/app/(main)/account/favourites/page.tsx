import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/shared/lib/admin-api";
import { FavouritesList } from "./FavouritesList";

export const metadata: Metadata = {
  title: "Tracked games · Nuka Loot",
  robots: { index: false, follow: false },
};

const FavouritesPage = async () => {
  const session = await getSession();
  if (!session) redirect("/?signin=1&next=/account/favourites");

  return (
    <main className="relative z-10 mx-auto w-full max-w-2xl px-5 pb-16">
      <h1 className="font-heading text-xl text-foreground">Tracked games</h1>
      <p className="mb-5 text-sm text-muted-foreground">
        Priced on the platforms you own. Change those in your account.
      </p>
      <FavouritesList signedIn />
    </main>
  );
};

export default FavouritesPage;
