"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Button } from "@/shared/UI/Button";
import { Input } from "@/shared/UI/Input";
import { Dialog } from "@/shared/UI/Dialog/Dialog";
import { login, type LoginState } from "@/shared/lib/auth-actions";
import { resendVerification } from "@/shared/lib/register-actions";
import { useUIStore } from "@/shared/stores/useUIStore";
import { GoogleMark } from "../atoms/GoogleMark";
import { RegisterForm } from "./RegisterForm";

const ERRORS: Record<string, string> = {
  google: "Signing in with Google is not set up yet.",
  cancelled: "You cancelled the Google sign-in.",
  state: "That sign-in link expired. Try again.",
  token: "Google would not confirm the sign-in. Try again.",
  profile: "Google would not share your details. Try again.",
  unverified: "Your Google email is not verified.",
};

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Signing in…" : "Sign in"}
    </Button>
  );
};

type LoginModalProps = {
  googleEnabled: boolean;
  /** True once somebody is signed in, so the dialog never reopens itself. */
  signedIn: boolean;
};

export const LoginModal = ({ googleEnabled, signedIn }: LoginModalProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const open = useUIStore((s) => s.signInOpen);
  const setOpen = useUIStore((s) => s.setSignInOpen);

  // Landing here with ?signin=1 means something needed a session — a guarded
  // page, or Google bouncing back with a problem — so the dialog opens itself.
  const wantsSignIn = searchParams.get("signin") === "1";
  const next = searchParams.get("next") ?? "/";
  const providerError = searchParams.get("error");

  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [resent, setResent] = useState(false);

  const [state, formAction] = useActionState<LoginState, FormData>(login, {
    error: null,
    ok: false,
  });

  useEffect(() => {
    if (wantsSignIn && !signedIn) setOpen(true);
  }, [wantsSignIn, signedIn, setOpen]);

  useEffect(() => {
    if (!state.ok) return;
    setOpen(false);
    // The header is rendered on the server, so it only knows about the new
    // session after a refresh.
    router.refresh();
    if (next !== "/") router.push(next);
  }, [state.ok, next, setOpen, router]);

  const message =
    state.error ?? (providerError ? ERRORS[providerError] ?? null : null);

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      title={mode === "signin" ? "Sign in" : "Create an account"}
      description="Track prices and get told when a game drops."
    >
      <div className="flex flex-col gap-3">
        {googleEnabled ? (
          <>
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-2"
              onClick={() => {
                window.location.href = `/api/auth/google/start?next=${encodeURIComponent(next)}`;
              }}
            >
              <GoogleMark />
              Continue with Google
            </Button>

            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <span className="h-px flex-1 bg-border" />
            </div>
          </>
        ) : null}

        {mode === "register" ? (
          <RegisterForm onSignIn={() => setMode("signin")} />
        ) : (
        <form action={formAction} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Email
            </span>
            <Input
              name="email"
              type="email"
              autoComplete="username"
              required
              className="h-10"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Password
            </span>
            <Input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="h-10"
            />
          </label>

          {message ? (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {message}
            </p>
          ) : null}

          {/* The password was right, so offering another link here is safe
              and saves them hunting for the first one. */}
          {state.needsVerification ? (
            <Button
              type="button"
              variant="outline"
              disabled={resent}
              onClick={() => {
                void resendVerification(state.needsVerification!);
                setResent(true);
              }}
            >
              {resent ? "Link sent — check your inbox" : "Send the link again"}
            </Button>
          ) : null}

          <SubmitButton />
        </form>
        )}

        <p className="pt-1 text-center text-xs text-muted-foreground">
          {mode === "signin" ? (
            <>
              No account?{" "}
              <button
                type="button"
                onClick={() => setMode("register")}
                className="cursor-pointer font-medium text-primary hover:underline"
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already have one?{" "}
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="cursor-pointer font-medium text-primary hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </Dialog>
  );
};
