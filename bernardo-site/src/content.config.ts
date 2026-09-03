import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const image = () =>
  z.object({
    src: z.string(),
    alt: z.string(),
    credit: z.string().optional(),
    place: z.string().optional(),
    year: z.string().optional(),
    // "X% Y%" en formato CSS object-position — dónde centrar el recorte cuadrado
    // de esta foto en la home/grillas. Sin valor = centrado (comportamiento de
    // siempre). Lo llena el panel /admin (encuadre visual en cover, selector de
    // posición en las fotos de la galería) — 3-sep-2026, a pedido de Ramón.
    focus: z.string().optional(),
    // Multiplicador de escala (ej. "1.6") aplicado sobre el punto de "focus" —
    // para cuando el encuadre no alcanza porque la foto es de cuerpo completo y
    // el sujeto se ve chico. Mismo campo/mecanismo que ya usa Modelo.
    zoom: z.string().optional(),
    // Voltea la miniatura en espejo (horizontal) — la foto original y la del
    // visor de tamaño completo no cambian. A pedido de Ramón (3-sep-2026).
    flip: z.boolean().optional(),
  });

// Esquema compartido: ambas colecciones aceptan opcionalmente cliente y
// publicación externa, para que una entrada se pueda mover libremente entre
// Retratos y Proyectos sin chocar con el schema (25 jul 2026: reestructuración
// pedida por Bernardo — antes "series"/"encargos" no compartían este shape).
const entryFields = {
  title: z.string(),
  client: z.string().optional(),
  year: z.string(),
  excerpt: z.string(),
  order: z.number(),
  cover: image(),
  images: z.array(image()).min(1).max(60),
  publication: z
    .object({
      name: z.string(),
      url: z.string(),
    })
    .optional(),
};

// Retratos — trabajo categorizado por tipo de sujeto: masculinos, femeninos,
// corporativos, modelos, actores.
const retratos = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!README.md'], base: './src/content/retratos' }),
  schema: z.object(entryFields),
});

// Proyectos — obra de carácter personal/conceptual (modelo Kander: la prueba
// se ve, no se declara).
const proyectos = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!README.md'], base: './src/content/proyectos' }),
  schema: z.object(entryFields),
});

export const collections = { retratos, proyectos };
