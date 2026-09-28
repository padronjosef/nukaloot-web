import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck, CircleX } from "lucide-react";
import { AdminApiError, callApi, type Session } from "@/shared/lib/admin-api";
import { Button } from "@/shared/UI/Button";

export const metadata: Metadata = {
  title: "Confirm your email · Nuka Loot",
  robots: { index: false, follow: false },
};

const VerifyPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) => {
  const { token } = await searchParams;

  let error: string | null = null;
  let email: string | null = null;

  if (!token) {
    error = "That link is missing its token.";
  } else {
    try {
      const session = await callApi<Session>("/auth/verify-email", {
        method: "POST",
        body: JSON.stringify({ token }),
      });
      email = session.user.email;
    } catch (err) {
      error =
        err instanceof AdminApiError
          ? err.message
          : "Could not confirm your email.";
    }
  }

  return (
    <main className="relative z-10 mx-auto w-full max-w-md px-5 pb-16">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center">
        {error ? (
          <>
            <CircleX className="size-8 text-destructive" />
            <h1 className="font-heading text-lg text-foreground">
              We could not confirm it
            </h1>
            <p className="text-sm text-muted-foreground">{error}</p>
            <p className="text-sm text-muted-foreground">
              Sign in with your email and password and we will send a fresh
              link.
            </p>
          </>
        ) : (
          <>
            <CircleCheck className="size-8 text-primary" />
            <h1 className="font-heading text-lg text-foreground">
              Your email is confirmed
            </h1>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{email}</span> can
              now sign in.
            </p>
          </>
        )}

        <Button
          render={<Link href={error ? "/?signin=1" : "/?signin=1"} />}
          size="lg"
          className="mt-2 w-full"
        >
          Sign in
        </Button>
      </div>
    </main>
  );
};

export default VerifyPage;
