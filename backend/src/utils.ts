import { createHash } from "crypto";

/**
 * SHA-256 hash of the raw Aadhaar number.
 * The plain-text number is never stored.
 */
export function hashAadhaar(aadhaar: string): string {
  return createHash("sha256").update(aadhaar).digest("hex");
}

/**
 * Generates a reference number in the format UDYAM-XX-00-0000000
 * where XX is a random 2-letter state code and the last 7 digits are
 * a zero-padded random number (matching the real Udyam format style).
 */
const STATE_CODES = [
  "AN", "AP", "AR", "AS", "BR", "CG", "CH", "DD", "DL", "DN",
  "GA", "GJ", "HP", "HR", "JH", "JK", "KA", "KL", "LA", "LD",
  "MH", "ML", "MN", "MP", "MZ", "NL", "OD", "PB", "PY", "RJ",
  "SK", "TG", "TN", "TR", "UK", "UP", "WB",
];

export function generateReferenceNumber(): string {
  const stateCode = STATE_CODES[Math.floor(Math.random() * STATE_CODES.length)];
  const serial = Math.floor(Math.random() * 9_999_999)
    .toString()
    .padStart(7, "0");
  return `UDYAM-${stateCode}-00-${serial}`;
}
