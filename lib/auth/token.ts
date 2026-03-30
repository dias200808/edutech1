import { jwtVerify, SignJWT } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "development-only-secret-change-me",
);

export type SessionTokenPayload = {
  userId: string;
  role: string;
  email: string;
  fullName: string;
};

export async function signSessionToken(payload: SessionTokenPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySessionToken(token: string) {
  const result = await jwtVerify<SessionTokenPayload>(token, secret);
  return result.payload;
}
