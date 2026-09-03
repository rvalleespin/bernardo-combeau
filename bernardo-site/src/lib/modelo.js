import galeriaData from '../data/modelo/galeria.json';
import selectedWorkData from '../data/modelo/selected-work.json';
import motion from '../data/modelo/motion.json';
import polaroidsData from '../data/modelo/polaroids.json';
import details from '../data/modelo/details.json';

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

export const motionVideos = gridDeVideos(motion.videos);
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

// Menú compartido por las tres páginas de Modelo (portada, Motion,
// Commercials). Motion y Commercials son páginas propias — no anclas — para
// que cada una tenga su propia URL; el resto son anclas de vuelta a la
// portada, así que llevan el prefijo /modelo/ para funcionar igual desde
// cualquiera de las tres páginas.
export const secciones = [
	galeriaData.fotos?.length && { href: '/modelo/#book', label: 'Book' },
	selectedWorkData.trabajos?.length && { href: '/modelo/#work', label: 'Work' },
	motionVideos.length > 0 && { href: '/modelo/motion', label: 'Motion' },
	comerciales.length > 0 && { href: '/modelo/commercials', label: 'Commercials' },
	polaroidsData.fotos?.length && { href: '/modelo/#polaroids', label: 'Polaroids' },
	detailGroups.length && { href: '/modelo/#details', label: 'Details' },
	{ href: '/modelo/#booking', label: 'Booking' },
].filter(Boolean);
