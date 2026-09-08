// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
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
  // 8-sep-2026: migrado de Vercel a Netlify (cambio de casa, mismo sitio — ver
  // revision-panel-admin-bernardo.md). Sin opciones = usa el Image CDN de Netlify
  // por defecto, el equivalente directo al imageService de Vercel que reemplaza.
  adapter: netlify(),
  integrations: [
    sitemap({
      filter: (page) => !enObra.some((ruta) => new URL(page).pathname.replace(/\/$/, '') === ruta),
    }),
  ],
  // 27 jul 2026: Series/Encargos se reestructuraron en Retratos/Proyectos (pedido de
  // Bernardo). Estas redirecciones evitan que un link ya compartido a las rutas viejas
  // quede muerto — cada entrada se redirige a la colección a la que se movió.
  // 3 sep 2026: dos entradas tenían slug de placeholder ("nombre-de-la-serie",
  // "aquí-estoy-creando-algo-nuevo") con contenido real detrás — se renombraron a
  // "actores" y "la-caida" (SPL-COT-2026-014, Parte 1). Se agregan redirects desde
  // ambas rutas viejas, y se actualiza el destino final de los redirects heredados de
  // /series que ya apuntaban a esas dos.
  redirects: {
    '/series': '/retratos',
    '/encargos': '/proyectos',
    '/series/serie-luz-lateral': '/retratos/serie-luz-lateral',
    '/series/nombre-de-la-serie': '/retratos/actores',
    '/series/la-septima': '/retratos/la-septima',
    '/series/serie-campo-de-flores': '/retratos/serie-campo-de-flores',
    '/series/serie-grafiti-urbano': '/proyectos/serie-grafiti-urbano',
    '/series/aquí-estoy-creando-algo-nuevo': '/proyectos/la-caida',
    '/series/serie-orejas-de-conejo': '/proyectos/serie-orejas-de-conejo',
    '/encargos/encargo-auto-binoculares': '/retratos/encargo-auto-binoculares',
    '/encargos/encargo-taburete-estudio': '/retratos/encargo-taburete-estudio',
    '/encargos/encargo-piscina-corbata': '/proyectos/encargo-piscina-corbata',
    // 3 sep 2026: el slug de estas dos entradas quedó pegado al nombre por
    // defecto que traían al crearlas en el panel — el título real ya no
    // calzaba (revisión del sitio, corrección #2). Al renombrar el archivo
    // (y por tanto la URL) para que el slug refleje el título real, cualquier
    // link ya compartido a la URL vieja se redirige en vez de quedar muerto.
    '/retratos/nombre-de-la-serie': '/retratos/actores',
    '/proyectos/aquí-estoy-creando-algo-nuevo': '/proyectos/la-caida',

    // El sitemap real vive en /sitemap-index.xml (así lo genera @astrojs/sitemap, y así
    // está declarado en robots.txt). Este alias es solo para herramientas que asumen la
    // ruta convencional /sitemap.xml sin leer robots.txt.
    '/sitemap.xml': '/sitemap-index.xml',
  },
});
