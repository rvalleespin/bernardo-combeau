// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // TODO: cambiar a bernardocombeau.cl (o el dominio que se compre) apenas esté conectado.
  site: 'https://bernardo-combeau.vercel.app',
  output: 'server',
  adapter: vercel(),
  integrations: [sitemap()],
});
