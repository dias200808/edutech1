import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";
import { getSessionUser, type SessionUser } from "@/lib/auth/session";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function fail(status: number, message: string, details?: unknown) {
  return NextResponse.json(
    { error: message, details: details ?? null },
    { status },
  );
}

export async function withApiAuth<T>(
  handler: (user: SessionUser) => Promise<T>,
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return fail(401, "Authentication required");
    }

    const data = await handler(user);
    return ok(data);
  } catch (error) {
    if (error instanceof ApiError) {
      return fail(error.status, error.message);
    }

    if (error instanceof ZodError) {
      return fail(400, "Validation failed", error.flatten());
    }

    console.error(error);
    return fail(500, "Internal server error");
  }
}

export async function parseBody<T>(request: Request, schema: ZodSchema<T>) {
  return schema.parse(await request.json());
}
