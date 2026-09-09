export const prerender = false;

import type { APIRoute } from 'astro';

function htmlPage(message: string) {
  return `<!doctype html>
<html><body>
<script>
(function() {
  function receiveMessage(e) {
    window.opener.postMessage(
      ${JSON.stringify(message)},
      e.origin
    );
    window.removeEventListener("message", receiveMessage, false);
  }
  window.addEventListener("message", receiveMessage, false);
  window.opener.postMessage("authorizing:github", "*");
})();
</script>
</body></html>`;
}

// Segundo paso del login: GitHub redirige aquí con un "code" de un solo uso,
// lo cambiamos por un token real (esto tiene que pasar en el servidor porque
// necesita el client secret, que nunca debe llegar al navegador) y se lo
// devolvemos al panel /admin vía postMessage.
export const GET: APIRoute = async ({ url, request }) => {
  const clientId = import.meta.env.GITHUB_OAUTH_CLIENT_ID;
  const clientSecret = import.meta.env.GITHUB_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return new Response('Falta configurar GITHUB_OAUTH_CLIENT_ID / GITHUB_OAUTH_CLIENT_SECRET en Netlify.', { status: 500 });
  }

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookieHeader = request.headers.get('cookie') ?? '';
  const cookieState = cookieHeader.match(/decap_oauth_state=([^;]+)/)?.[1];

  if (!code || !state || state !== cookieState) {
    return new Response(
      htmlPage('authorization:github:error:{"message":"Estado inválido, intenta iniciar sesión de nuevo."}'),
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  });
  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    return new Response(
      htmlPage(`authorization:github:error:${JSON.stringify(JSON.stringify(tokenData))}`),
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  const payload = JSON.stringify({ token: tokenData.access_token, provider: 'github' });
  return new Response(htmlPage(`authorization:github:success:${payload}`), {
    headers: { 'Content-Type': 'text/html' },
  });
};
