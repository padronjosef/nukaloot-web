import { NextRequest, NextResponse } from "next/server";
import {
  AdminApiError,
  callApi,
  requirePermission,
  type AdminUser,
} from "@/shared/lib/admin-api";

type Context = { params: Promise<{ id: string }> };

const fail = (error: unknown) => {
  const status = error instanceof AdminApiError ? error.status || 502 : 500;
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Request failed." },
    { status },
  );
};

export const PATCH = async (request: NextRequest, { params }: Context) => {
  try {
    const session = await requirePermission("MANAGE_ACCESS");
    const { id } = await params;
    const user = await callApi<AdminUser>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(await request.json()),
      actorId: session.user.id,
    });
    return NextResponse.json(user);
  } catch (error) {
    return fail(error);
  }
};

export const DELETE = async (_request: NextRequest, { params }: Context) => {
  try {
    const session = await requirePermission("MANAGE_ACCESS");
    const { id } = await params;
    await callApi<void>(`/users/${id}`, {
      method: "DELETE",
      actorId: session.user.id,
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return fail(error);
  }
};
