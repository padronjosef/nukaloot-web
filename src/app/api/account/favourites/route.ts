import { NextRequest, NextResponse } from "next/server";
import {
  AdminApiError,
  callApi,
  requireSession,
} from "@/shared/lib/admin-api";
import type { FavouriteList, FavouriteAdded } from "@/shared/lib/favourites";

const fail = (error: unknown) => {
  const status = error instanceof AdminApiError ? error.status || 502 : 500;
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Request failed." },
    { status },
  );
};

export const GET = async () => {
  try {
    const session = await requireSession();
    const data = await callApi<FavouriteList>("/favourites", {
      actorId: session.user.id,
    });
    return NextResponse.json(data);
  } catch (error) {
    return fail(error);
  }
};

export const POST = async (request: NextRequest) => {
  try {
    const session = await requireSession();
    const body = (await request.json()) as { gameName?: string };

    const data = await callApi<FavouriteAdded>("/favourites", {
      method: "POST",
      body: JSON.stringify({ gameName: body.gameName }),
      actorId: session.user.id,
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return fail(error);
  }
};
