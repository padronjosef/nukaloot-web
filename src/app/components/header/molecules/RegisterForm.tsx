"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, MailCheck } from "lucide-react";
import { Button } from "@/shared/UI/Button";
import { Input } from "@/shared/UI/Input";
import { register, type RegisterState } from "@/shared/lib/register-actions";

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Creating…" : "Create account"}
    </Button>
  );
};

export const RegisterForm = ({ onSignIn }: { onSignIn: () => void }) => {
  const [state, formAction] = useActionState<RegisterState, FormData>(register, {
    error: null,
    sentTo: null,
  });

  if (state.sentTo) {
    return (
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <MailCheck className="size-7 text-primary" />
        <p className="text-sm text-foreground">
          Check <span className="font-medium">{state.sentTo}</span> for a link
          to confirm your account.
        </p>
        <p className="text-xs text-muted-foreground">
          The link works for 24 hours. If nothing arrives, look in spam.
        </p>
        <Button variant="outline" className="mt-1 w-full" onClick={onSignIn}>
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Email</span>
        <Input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-10"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          Name <span className="font-normal">(optional)</span>
        </span>
        <Input name="name" autoComplete="name" className="h-10" />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          Password
        </span>
        <Input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={10}
          required
          className="h-10"
        />
        <span className="text-xs text-muted-foreground">
          At least 10 characters.
        </span>
      </label>

      {state.error ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
};
