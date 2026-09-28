import { NextRequest, NextResponse } from "next/server";
import {
  AdminApiError,
  callApi,
  requirePermission,
  type AdminUser,
} from "@/shared/lib/admin-api";

const fail = (error: unknown) => {
  const status = error instanceof AdminApiError ? error.status || 502 : 500;
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Request failed." },
    { status },
  );
};

export const GET = async () => {
  try {
    const session = await requirePermission("MANAGE_ACCESS");
    const users = await callApi<AdminUser[]>("/users", {
      actorId: session.user.id,
    });
    return NextResponse.json(users);
  } catch (error) {
    return fail(error);
  }
};

export const POST = async (request: NextRequest) => {
  try {
    const session = await requirePermission("MANAGE_ACCESS");
    const user = await callApi<AdminUser>("/users", {
      method: "POST",
      body: JSON.stringify(await request.json()),
      actorId: session.user.id,
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return fail(error);
  }
};
