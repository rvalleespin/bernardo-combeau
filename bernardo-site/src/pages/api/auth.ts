export const prerender = false;

import type { APIRoute } from 'astro';

// Primer paso del login del panel /admin: manda a Bernardo a la pantalla de
// autorización de GitHub. El segundo paso lo maneja api/callback.ts.
export const GET: APIRoute = async ({ url, redirect }) => {
  const clientId = import.meta.env.GITHUB_OAUTH_CLIENT_ID;
  if (!clientId) {
    return new Response('Falta configurar GITHUB_OAUTH_CLIENT_ID en Vercel.', { status: 500 });
  }

  const state = crypto.randomUUID();
  const redirectUri = new URL('/api/callback', url.origin).toString();

  const authorizeUrl = new URL('https://github.com/login/oauth/authorize');
  authorizeUrl.searchParams.set('client_id', clientId);
  authorizeUrl.searchParams.set('redirect_uri', redirectUri);
  authorizeUrl.searchParams.set('scope', 'repo,user');
  authorizeUrl.searchParams.set('state', state);

  const response = redirect(authorizeUrl.toString());
  response.headers.append(
    'Set-Cookie',
    `decap_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
  );
  return response;
};
