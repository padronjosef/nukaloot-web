import { NextRequest, NextResponse } from "next/server";
import {
  AdminApiError,
  callApi,
  requireSession,
  type Session,
} from "@/shared/lib/admin-api";

export const PATCH = async (request: NextRequest) => {
  try {
    // The id comes from the signed session cookie, never from the body, so
    // this can only ever edit the person making the request.
    const session = await requireSession();
    const body = (await request.json()) as Record<string, unknown>;

    const updated = await callApi<Session>(
      `/auth/profile/${session.user.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          name: body.name,
          currentPassword: body.currentPassword || undefined,
          newPassword: body.newPassword || undefined,
        }),
      },
    );

    return NextResponse.json(updated);
  } catch (error) {
    const status = error instanceof AdminApiError ? error.status || 502 : 500;
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not save your profile.",
      },
      { status },
    );
  }
};
