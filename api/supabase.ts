export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  const url = new URL(req.url);
  
  // Extrai o caminho relativo do Supabase (ex: /rest/v1/..., /auth/v1/...)
  let supabasePath = url.pathname.replace(/^\/api\/supabase/, "");
  
  // Se o caminho vier via query param do rewrite (ex: ?path=...)
  if (url.searchParams.has("path")) {
    supabasePath = "/" + url.searchParams.get("path");
    url.searchParams.delete("path");
  }

  const queryString = url.searchParams.toString();
  const fullTargetQuery = queryString ? `?${queryString}` : "";

  // Lê as chaves secretas do servidor (sem prefixo VITE_, nunca expostas ao navegador)
  const supabaseUrl = (
    process.env.SUPABASE_URL || 
    process.env.VITE_SUPABASE_URL || 
    ""
  ).replace(/\/$/, "");

  const supabaseKey = 
    process.env.SUPABASE_ANON_KEY || 
    process.env.VITE_SUPABASE_ANON_KEY || 
    "";

  if (!supabaseUrl || !supabaseKey) {
    return new Response(
      JSON.stringify({ 
        error: "Supabase server environment variables (SUPABASE_URL, SUPABASE_ANON_KEY) are not configured in Vercel." 
      }), 
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const targetUrl = `${supabaseUrl}${supabasePath}${fullTargetQuery}`;

  // Clona os headers e injeta as credenciais de servidor de forma segura
  const forwardHeaders = new Headers();
  for (const [key, val] of req.headers.entries()) {
    // Ignora headers específicos de host
    if (key.toLowerCase() !== "host" && key.toLowerCase() !== "content-length") {
      forwardHeaders.set(key, val);
    }
  }

  // Injeta apikey do servidor
  forwardHeaders.set("apikey", supabaseKey);

  // Se o usuário estiver logado com token próprio, preserva o token.
  // Caso contrário, injeta o token anon do servidor para acesso público seguro
  const existingAuth = req.headers.get("authorization");
  if (!existingAuth || existingAuth === "Bearer proxy-client-key" || existingAuth === "Bearer public") {
    forwardHeaders.set("authorization", `Bearer ${supabaseKey}`);
  }

  const body = (req.method !== "GET" && req.method !== "HEAD") ? req.body : undefined;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body,
      // @ts-ignore
      duplex: body ? "half" : undefined,
    });

    const responseHeaders = new Headers(response.headers);
    // Permite que o frontend receba cabeçalhos do PostgREST (como Content-Range para paginação)
    responseHeaders.set("Access-Control-Expose-Headers", "Content-Range, Range-Unit, Preference-Applied");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "Failed to forward request to Supabase", details: err.message }), 
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
