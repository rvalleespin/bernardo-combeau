import { getImage } from 'astro:assets';
import galeriaData from '../data/modelo/galeria.json';
import selectedWorkData from '../data/modelo/selected-work.json';
import motion from '../data/modelo/motion.json';
import polaroidsData from '../data/modelo/polaroids.json';
import details from '../data/modelo/details.json';

// Anchos VALIDOS del optimizador de Vercel en este proyecto
// (.vercel/output/config.json -> images.sizes). Verificado en un build real:
// getImage() ajusta solo cualquier otro valor al mas cercano, y si se omite
// `quality` el adaptador pone q=100. Nunca armar la URL a mano: en `astro dev`
// el endpoint es otro (/_image?href=...) y daria 404 en local.
const LB_ANCHOS = [1200, 1920, 2048];

// Precalcula el set de anchos del visor de tamaño completo para cada foto de
// una lista — compartido por cualquier grilla de fotos de Modelo (Book,
// Selected Work, Polaroids, Motion).
export async function conVisor(fotos) {
	return Promise.all((fotos || []).map(async (f) => {
		const lb = {};
		for (const w of LB_ANCHOS) {
			lb[w] = (await getImage({ src: f.src, width: w, quality: 82 })).src;
		}
		return { ...f, lb };
	}));
}

// "Encuadre" (posicion) elige qué franja de la miniatura se ve — no alcanza
// cuando el sujeto se ve chico porque la foto es de cuerpo completo, tomada
// de lejos, en un espacio pensado para un plano cerrado (pasó con la
// polaroid 3). "Zoom" acerca la miniatura sobre ese mismo punto con
// transform:scale() + transform-origin — la foto que abre el visor no lleva
// este estilo, así que sigue siendo la original sin recortar.
export function encuadreStyle(img) {
	if (!img) return undefined;
	const posY = img.posicion || '50%';
	const zoom = img.zoom ? Number(img.zoom) : 1;
	const props = [];
	if (img.posicion) props.push(`object-position:50% ${posY}`);
	if (zoom > 1) props.push(`transform:scale(${zoom})`, `transform-origin:50% ${posY}`);
	return props.length ? props.join(';') : undefined;
}

// Ni el reel ni el loop de fondo se suben al repo: Git no es lugar para video
// pesado. El reel vive en YouTube/Vimeo; el loop de fondo es un mp4 alojado
// fuera (Vercel Blob, R2, Bunny) y referenciado por URL.
export function parseReel(url) {
	if (!url) return null;
	const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([\w-]+)/);
	if (yt) return { tipo: 'youtube', id: yt[1] };
	// El hash de privacidad de Vimeo es parte del identificador: sin el, un
	// video no listado (lo normal en este rubro) responde "does not exist".
	const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([0-9a-zA-Z]+))?/);
	if (vimeo) {
		const h = url.match(/[?&]h=([0-9a-zA-Z]+)/);
		return { tipo: 'vimeo', id: vimeo[1], hash: vimeo[2] || (h ? h[1] : null) };
	}
	return null;
}

// Grilla de video: un cuadrito por video, que redirige a YouTube (no se
// embebe). La miniatura sale del thumbnail público de YouTube — no hace
// falta que Bernardo suba una imagen aparte. Vimeo no tiene una miniatura
// pública así de simple, así que esos quedan sin imagen (se ve el ícono de
// play solo) en vez de inventar una. Mismo mecanismo para "Motion" y para
// "Commercials" — son dos listas de video separadas, no una sola.
export function gridDeVideos(lista) {
	return (lista || [])
		.map((c) => ({ ...c, parsed: parseReel(c.url) }))
		.filter((c) => c.nombre && c.parsed)
		.map((c) => ({
			nombre: c.nombre,
			url: c.url,
			thumb: c.parsed.tipo === 'youtube' ? `https://img.youtube.com/vi/${c.parsed.id}/hqdefault.jpg` : null,
		}));
}

// Motion es una galería de fotos (no videos, a diferencia de Commercials):
// mismo criterio de filtro que las otras galerías de Modelo, solo entran las
// que de verdad tienen imagen cargada.
export const motionFotos = (motion.fotos || []).filter((f) => f.src);
export const comerciales = gridDeVideos(motion.comerciales);

// Tres columnas, como pidio Bernardo: la altura sola, las tres medidas de
// cuerpo siempre juntas, y el resto de los rasgos aparte. Cada columna se
// cae sola si no tiene ningun dato cargado.
export const detailGroups = [
	[['Height', details?.height]],
	[['Chest', details?.chest], ['Waist', details?.waist], ['Hips', details?.hips]],
	[['Shoes', details?.shoes], ['Hair', details?.hair], ['Eyes', details?.eyes]],
]
	.map((group) => group.filter(([, v]) => v))
	.filter((group) => group.length > 0);

// Menú compartido por las cuatro páginas de Modelo (portada, Work, Motion,
// Commercials). Work, Motion y Commercials son páginas propias — no anclas —
// para que cada una tenga su propia URL; el resto son anclas de vuelta a la
// portada, así que llevan el prefijo /modelo/ para funcionar igual desde
// cualquiera de las cuatro páginas.
export const secciones = [
	galeriaData.fotos?.length && { href: '/modelo/#book', label: 'Book' },
	selectedWorkData.trabajos?.length && { href: '/modelo/work', label: 'Work' },
	motionFotos.length > 0 && { href: '/modelo/motion', label: 'Motion' },
	comerciales.length > 0 && { href: '/modelo/commercials', label: 'Commercials' },
	polaroidsData.fotos?.length && { href: '/modelo/#polaroids', label: 'Polaroids' },
	detailGroups.length && { href: '/modelo/#details', label: 'Details' },
	{ href: '/modelo/#booking', label: 'Booking' },
].filter(Boolean);
