import "server-only";

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name} environment variable`);
  }

  return value;
}

const username = getRequiredEnv("ADMIN_USERNAME");
const password = getRequiredEnv("ADMIN_PASSWORD");
const secret = getRequiredEnv("AUTH_SECRET");

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