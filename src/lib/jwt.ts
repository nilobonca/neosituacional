/**
 * Utilitários para decodificação e inspeção de JSON Web Tokens (JWT) no frontend.
 */

export interface AdminInviteJwtPayload {
  jti: string; // Invite ID
  email: string;
  role: string;
  iat: number; // Issued at (timestamp em segundos)
  exp: number; // Expiration (timestamp em segundos)
}

/**
 * Decodifica o payload de um JWT sem necessidade de bibliotecas externas pesadas.
 */
export function decodeJwtPayload<T = AdminInviteJwtPayload>(token: string): T | null {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Converte base64url para base64 padrão
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload) as T;
  } catch (err) {
    console.error("Erro ao decodificar JWT:", err);
    return null;
  }
}

/**
 * Verifica se o token JWT já expirou localmente com base na claim `exp`.
 */
export function isJwtExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) return true;

  const currentTimestampInSeconds = Math.floor(Date.now() / 1000);
  return payload.exp < currentTimestampInSeconds;
}
