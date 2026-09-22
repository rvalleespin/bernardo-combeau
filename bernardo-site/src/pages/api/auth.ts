export const prerender = false;

import type { APIRoute } from 'astro';

// Primer paso del login del panel /admin: manda a Bernardo a la pantalla de
// autorización de GitHub. El segundo paso lo maneja api/callback.ts.
export const GET: APIRoute = async ({ url, redirect }) => {
  // Se lee en runtime con process.env y no con import.meta.env: Vite reemplaza
  // import.meta.env al compilar, así que el valor quedaría escrito dentro del
  // bundle desplegado. Para el client id eso sería inofensivo (es público, viaja
  // en la URL de autorización), pero callback.ts necesita lo mismo para el client
  // secret, donde sí importa — mismo mecanismo en los dos para no dejar dos
  // formas distintas de leer lo mismo. (22-sep-2026)
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  if (!clientId) {
    return new Response('Falta configurar GITHUB_OAUTH_CLIENT_ID en Netlify.', { status: 500 });
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
