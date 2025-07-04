export const config = {
  runtime: 'edge',
};

const N8N_API_BASE = 'https://n8n.t8h.io/v1';

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api\/v1\//, '');
  const targetUrl = `${N8N_API_BASE}/${path}`;

  // Копируем все заголовки, кроме host и x-forwarded-*
  const headers = new Headers(req.headers);
  headers.delete('host');
  [...headers.keys()].forEach((key) => {
    if (key.startsWith('x-forwarded')) headers.delete(key);
  });

  const fetchOptions: RequestInit = {
    method: req.method,
    headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
  };

  try {
    const apiRes = await fetch(targetUrl, fetchOptions);
    const resHeaders = new Headers(apiRes.headers);
    const body = await apiRes.arrayBuffer();
    return new Response(body, {
      status: apiRes.status,
      headers: resHeaders,
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: 'Proxy error', details: error?.message || error }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
} 