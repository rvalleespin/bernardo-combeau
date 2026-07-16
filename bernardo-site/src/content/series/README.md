Cada serie (obra personal) es un archivo `.md` en esta carpeta con este frontmatter:

```yaml
---
title: "Nombre de la serie"
year: "2024–2025"
excerpt: "Una o dos frases de contexto, no descripción literal de las fotos."
order: 1
cover:
  src: "/series/nombre-de-la-serie/portada.jpg"
  alt: "Descripción de la imagen para lectores de pantalla"
images:
  - src: "/series/nombre-de-la-serie/01.jpg"
    alt: "..."
    credit: "© Bernardo Combeau"
    place: "Valparaíso, Chile"
    year: "2024"
---
Texto breve de la serie en el cuerpo del markdown (opcional, si excerpt no basta).
```

Reglas:
- Entre 1 y 10 imágenes por serie (ajustado 16 jul 2026 a pedido de Bernardo — antes era 60;
  ver `content.config.ts` para el límite real que valida el build, y `public/admin/index.html`
  para el límite que aplica el panel).
- Toda imagen lleva crédito y contexto cuando se conoce: lugar, año, ©.
- No inventar datos: si no hay lugar/año confirmado, omitir el campo, no rellenar.
- Estas entradas se pueden crear/editar directo desde el panel `/admin` (colección "Series"),
  no solo a mano en el repo.
