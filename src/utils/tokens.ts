import crypto from "node:crypto";

export function generateRawToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createHashedToken(bytes = 32): {
  raw: string;
  hash: string;
} {
  const raw = generateRawToken(bytes);
  return { raw, hash: hashToken(raw) };
}
