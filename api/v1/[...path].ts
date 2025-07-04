const N8N_API_BASE = 'https://n8n.t8h.io/v1';

export default async function handler(req: any, res: any) {
  const { path = [] } = req.query;
  const targetUrl = `${N8N_API_BASE}/${Array.isArray(path) ? path.join('/') : path}`;

  // Копируем все заголовки, кроме host и x-forwarded-*
  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (!key.startsWith('x-forwarded') && key !== 'host' && value !== undefined) {
      if (Array.isArray(value)) {
        headers[key] = value.join(',');
      } else {
        headers[key] = String(value);
      }
    }
  }

  let body: any = undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    if (typeof req.body === 'string' || req.body instanceof Buffer) {
      body = req.body;
    } else if (req.headers['content-type']?.includes('application/json')) {
      body = JSON.stringify(req.body);
    }
  }

  const fetchOptions: RequestInit = {
    method: req.method,
    headers,
    body,
  };

  try {
    const apiRes = await fetch(targetUrl, fetchOptions);
    const contentType = apiRes.headers.get('content-type') || '';
    res.status(apiRes.status);
    res.setHeader('content-type', contentType);
    const buffer = await apiRes.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error: any) {
    res.status(500).json({ error: 'Proxy error', details: error?.message || error });
  }
} 