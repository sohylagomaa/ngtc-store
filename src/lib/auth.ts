import "server-only";

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;
const secret = process.env.AUTH_SECRET;

if (!username) {
  throw new Error("Missing ADMIN_USERNAME environment variable");
}

if (!password) {
  throw new Error("Missing ADMIN_PASSWORD environment variable");
}

if (!secret) {
  throw new Error("Missing AUTH_SECRET environment variable");
}

const secretKey = new TextEncoder().encode(secret);

export async function verifyAdminCredentials(
  inputUsername: string,
  inputPassword: string
) {
  if (inputUsername !== username) {
    return false;
  }

  return bcrypt.compare(inputPassword, password);
}

export async function createAdminToken() {
  return new SignJWT({
    role: "admin",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifyAdminToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey);

    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) {
    return false;
  }

  return verifyAdminToken(token);
}