import { NextResponse } from "next/server";
import {
  AdminApiError,
  callApi,
  requireSession,
} from "@/shared/lib/admin-api";

export const DELETE = async (
  _request: Request,
  { params }: { params: Promise<{ gameId: string }> },
) => {
  try {
    const session = await requireSession();
    const { gameId } = await params;

    await callApi(`/favourites/${encodeURIComponent(gameId)}`, {
      method: "DELETE",
      actorId: session.user.id,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const status = error instanceof AdminApiError ? error.status || 502 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Request failed." },
      { status },
    );
  }
};
