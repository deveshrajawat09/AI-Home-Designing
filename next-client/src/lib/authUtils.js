/** Decode JWT payload (client-side display only; API still verifies the token). */
export function decodeJwtPayload(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Check if a JWT token is expired. Returns true if expired or invalid. */
export function isTokenExpired(token) {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false; // no expiry = treat as valid
  return payload.exp * 1000 < Date.now();
}

/** Get remaining token validity in human-readable format. */
export function tokenExpiresIn(token) {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return "never";
  const ms = payload.exp * 1000 - Date.now();
  if (ms <= 0) return "expired";
  const hours = Math.floor(ms / 3600000);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  return "< 1h";
}
