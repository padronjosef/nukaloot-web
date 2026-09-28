import { NextRequest, NextResponse } from "next/server";
import {
  AdminApiError,
  callApi,
  requireSession,
} from "@/shared/lib/admin-api";
import { cleanPlatformChoice } from "@/shared/lib/stores/types";
import type { Platform } from "@/shared/lib/stores/types";

type PlatformsResponse = { platforms: Platform[] };

/**
 * Sets the platforms for one saved game. A null body clears the override so
 * the game follows the account again — which is different from an empty list,
 * and is why the two are told apart here rather than both read as "none".
 */
export const PATCH = async (
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> },
) => {
  try {
    const session = await requireSession();
    const { gameId } = await params;
    const body = (await request.json()) as { platforms?: unknown };

    const following = body.platforms === null;
    const platforms = following ? null : cleanPlatformChoice(body.platforms);

    if (platforms && platforms.length === 0) {
      return NextResponse.json(
        { error: "Pick at least one platform." },
        { status: 400 },
      );
    }

    const data = await callApi<PlatformsResponse>(
      `/favourites/${encodeURIComponent(gameId)}/platforms`,
      {
        method: "PATCH",
        body: JSON.stringify({ platforms }),
        actorId: session.user.id,
      },
    );

    return NextResponse.json(data);
  } catch (error) {
    const status = error instanceof AdminApiError ? error.status || 502 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Request failed." },
      { status },
    );
  }
};
