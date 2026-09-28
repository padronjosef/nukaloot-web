import { NextRequest, NextResponse } from "next/server";
import {
  AdminApiError,
  callApi,
  requireSession,
} from "@/shared/lib/admin-api";
import { cleanPlatformChoice } from "@/shared/lib/stores/types";
import type { Platform } from "@/shared/lib/stores/types";

type PlatformsResponse = { platforms: Platform[] };

const fail = (error: unknown) => {
  const status = error instanceof AdminApiError ? error.status || 502 : 500;
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Request failed." },
    { status },
  );
};

export const PUT = async (request: NextRequest) => {
  try {
    const session = await requireSession();
    const body = (await request.json()) as { platforms?: unknown };

    // Checked here as well as in the API: an empty list stored anywhere is
    // what puts console keys back in front of a PC-only buyer, and refusing
    // early means the person sees why instead of a silent no-op.
    const platforms = cleanPlatformChoice(body.platforms);

    if (platforms.length === 0) {
      return NextResponse.json(
        { error: "Pick at least one platform." },
        { status: 400 },
      );
    }

    const data = await callApi<PlatformsResponse>("/favourites/platforms", {
      method: "PUT",
      body: JSON.stringify({ platforms }),
      actorId: session.user.id,
    });

    return NextResponse.json(data);
  } catch (error) {
    return fail(error);
  }
};
