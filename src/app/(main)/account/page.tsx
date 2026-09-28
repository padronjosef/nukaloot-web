import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { callApi, getSession } from "@/shared/lib/admin-api";
import type { Platform } from "@/shared/lib/stores/types";
import { ProfileForm } from "./ProfileForm";
import { PlatformPreferences } from "./PlatformPreferences";

export const metadata: Metadata = {
  title: "Your account · Nuka Loot",
  robots: { index: false, follow: false },
};

/**
 * The API is a separate deploy and can be down. Falling back to PC keeps the
 * page usable instead of blocking the whole account behind one call, and PC is
 * what the API itself falls back to — so the form never shows a setting the
 * server disagrees with.
 */
const platformsFor = async (userId: string): Promise<Platform[]> => {
  try {
    const data = await callApi<{ platforms?: Platform[] }>("/favourites", {
      actorId: userId,
    });
    return data.platforms?.length ? data.platforms : ["pc"];
  } catch {
    return ["pc"];
  }
};

const AccountPage = async () => {
  const session = await getSession();
  if (!session) redirect("/?signin=1&next=/account");

  const platforms = await platformsFor(session.user.id);

  return (
    <main className="relative z-10 mx-auto w-full max-w-2xl px-5 pb-16">
      <h1 className="font-heading text-xl text-foreground">Your account</h1>
      <p className="mb-5 text-sm text-muted-foreground">
        Your details and how you sign in.
      </p>
      <div className="flex flex-col gap-4">
        <ProfileForm user={session.user} />
        <PlatformPreferences initial={platforms} />
      </div>
    </main>
  );
};

export default AccountPage;
