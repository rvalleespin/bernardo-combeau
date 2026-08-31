// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import { readFileSync } from 'node:fs';

// Una página cuyo título de menú está vacío se considera "en obra": no se
// anuncia en el sitio ni se ofrece a buscadores. Sacarla del menú no basta,
// porque el sitemap la seguiría entregando igual.
const nav = JSON.parse(readFileSync(new URL('./src/data/nav.json', import.meta.url), 'utf-8'));
const enObra = Object.entries({ modelo: '/modelo' })
  .filter(([clave]) => !(nav[clave] && nav[clave].trim()))
  .map(([, ruta]) => ruta);

// https://astro.build/config
export default defineConfig({
  site: 'https://bernardocombeau.cl',
  output: 'server',
  adapter: vercel({ imageService: true }),
  integrations: [
    sitemap({
      filter: (page) => !enObra.some((ruta) => new URL(page).pathname.replace(/\/$/, '') === ruta),
    }),
  ],
  // 27 jul 2026: Series/Encargos se reestructuraron en Retratos/Proyectos (pedido de
  // Bernardo). Estas redirecciones evitan que un link ya compartido a las rutas viejas
  // quede muerto — cada entrada se redirige a la colección a la que se movió.
  redirects: {
    '/series': '/retratos',
    '/encargos': '/proyectos',
    '/series/serie-luz-lateral': '/retratos/serie-luz-lateral',
    '/series/nombre-de-la-serie': '/retratos/nombre-de-la-serie',
    '/series/la-septima': '/retratos/la-septima',
    '/series/serie-campo-de-flores': '/retratos/serie-campo-de-flores',
    '/series/serie-grafiti-urbano': '/proyectos/serie-grafiti-urbano',
    '/series/aquí-estoy-creando-algo-nuevo': '/proyectos/aquí-estoy-creando-algo-nuevo',
    '/series/serie-orejas-de-conejo': '/proyectos/serie-orejas-de-conejo',
    '/encargos/encargo-auto-binoculares': '/retratos/encargo-auto-binoculares',
    '/encargos/encargo-taburete-estudio': '/retratos/encargo-taburete-estudio',
    '/encargos/encargo-piscina-corbata': '/proyectos/encargo-piscina-corbata',
  },
});
