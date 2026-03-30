import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { signSessionToken, verifySessionToken } from "@/lib/auth/token";

export const SESSION_COOKIE = "school_diary_session";

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
};

export async function createSession(user: {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
}) {
  const token = await signSessionToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    fullName: `${user.firstName} ${user.lastName}`,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = await verifySessionToken(token);
    const user = await db.user.findFirst({
      where: { id: payload.userId, isActive: true },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
    };
  } catch {
    return null;
  }
}

export async function requireSession() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(roles: Role[]) {
  const user = await requireSession();
  if (!roles.includes(user.role)) redirect("/dashboard");
  return user;
}
