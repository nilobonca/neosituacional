export const config = {
  runtime: "edge",
};

// Headers that must NEVER be forwarded to the client (could leak server secrets)
const BLOCKED_RESPONSE_HEADERS = new Set([
  "server",
  "x-powered-by",
  "x-kong-upstream-latency",
  "x-kong-proxy-latency",
  "via",
  "cf-ray",
  "cf-cache-status",
  "x-envoy-upstream-service-time",
  "sb-gateway-version",
]);

// Only allow proxy to reach the configured Supabase host — prevents SSRF
const ALLOWED_SUPABASE_PATHS = [
  "/rest/v1/",
  "/auth/v1/",
  "/storage/v1/",
  "/realtime/v1/",
  "/functions/v1/",
  "/graphql/v1",
];

export default async function handler(req: Request) {
  // ── CORS Preflight ──
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info, Prefer, Range, Accept-Profile, Content-Profile",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  const url = new URL(req.url);

  // Extrai o caminho relativo do Supabase (ex: /rest/v1/..., /auth/v1/...)
  let supabasePath = url.pathname.replace(/^\/api\/supabase/, "");

  // Se o caminho vier via query param do rewrite (ex: ?path=...)
  if (url.searchParams.has("path")) {
    supabasePath = "/" + url.searchParams.get("path");
    url.searchParams.delete("path");
  }

  // ── SSRF Protection: Validar que o path é um endpoint legítimo do Supabase ──
  if (!supabasePath || supabasePath === "/") {
    return new Response(
      JSON.stringify({ error: "Missing Supabase path." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const isAllowedPath = ALLOWED_SUPABASE_PATHS.some(
    (prefix) => supabasePath.startsWith(prefix)
  );
  if (!isAllowedPath) {
    return new Response(
      JSON.stringify({ error: "Blocked: path not in allowed Supabase API routes." }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // ── Path Traversal Protection ──
  if (supabasePath.includes("..") || supabasePath.includes("//")) {
    return new Response(
      JSON.stringify({ error: "Invalid path." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const queryString = url.searchParams.toString();
  const fullTargetQuery = queryString ? `?${queryString}` : "";

  // Lê as chaves secretas do servidor (sem prefixo VITE_, nunca expostas ao navegador)
  const supabaseUrl = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const supabaseKey = process.env.SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !supabaseKey) {
    return new Response(
      JSON.stringify({
        error: "Server configuration error. Contact the administrator.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const targetUrl = `${supabaseUrl}${supabasePath}${fullTargetQuery}`;

  // ── Build forwarded headers (whitelist approach) ──
  const forwardHeaders = new Headers();

  // Only forward safe, necessary headers
  const SAFE_REQUEST_HEADERS = [
    "content-type",
    "accept",
    "prefer",
    "range",
    "accept-profile",
    "content-profile",
    "x-client-info",
  ];

  for (const headerName of SAFE_REQUEST_HEADERS) {
    const val = req.headers.get(headerName);
    if (val) {
      forwardHeaders.set(headerName, val);
    }
  }

  // Injeta apikey do servidor
  forwardHeaders.set("apikey", supabaseKey);

  // Se o usuário estiver logado com token próprio (JWT real), preserva o token.
  // Caso contrário, injeta o token anon do servidor para acesso público seguro.
  const existingAuth = req.headers.get("authorization");
  if (
    existingAuth &&
    existingAuth !== "Bearer proxy-client-key" &&
    existingAuth !== "Bearer public" &&
    existingAuth.startsWith("Bearer ey") // Only forward real JWT tokens
  ) {
    forwardHeaders.set("authorization", existingAuth);
  } else {
    forwardHeaders.set("authorization", `Bearer ${supabaseKey}`);
  }

  const body =
    req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body,
      // @ts-ignore
      duplex: body ? "half" : undefined,
    });

    // ── Sanitize response headers before sending to client ──
    const responseHeaders = new Headers();

    // Only forward safe response headers
    const SAFE_RESPONSE_HEADERS = [
      "content-type",
      "content-range",
      "range-unit",
      "preference-applied",
      "cache-control",
      "x-total-count",
    ];

    for (const headerName of SAFE_RESPONSE_HEADERS) {
      const val = response.headers.get(headerName);
      if (val) {
        responseHeaders.set(headerName, val);
      }
    }

    responseHeaders.set(
      "Access-Control-Expose-Headers",
      "Content-Range, Range-Unit, Preference-Applied, X-Total-Count"
    );

    // Security headers
    responseHeaders.set("X-Content-Type-Options", "nosniff");
    responseHeaders.set("X-Frame-Options", "DENY");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: "Service temporarily unavailable.",
      }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
