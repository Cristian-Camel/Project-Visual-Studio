import { Presentation, Slide, SlideElementType } from '../types/presentation';

const now = () => new Date().toISOString();

export const createBaseSlide = (): Slide => ({
  id: crypto.randomUUID(),
  title: 'Nueva diapositiva',
  transition: 'fade',
  background: { mode: 'color', value: '#FFFFFF' },
  elements: [],
});

export const createPresentation = (name: string): Presentation => ({
  id: crypto.randomUUID(),
  name,
  description: 'Presentación creada en Visual Studio Presentations',
  themeId: 'aurora',
  createdAt: now(),
  updatedAt: now(),
  slides: [createBaseSlide()],
});

export const createElement = (type: SlideElementType) => {
  const base = {
    id: crypto.randomUUID(),
    type,
    position: { x: 120, y: 120, width: 360, height: 140 },
    animation: 'fade' as const,
    hidden: false,
  };

  const defaults: Record<SlideElementType, Record<string, unknown>> = {
    title: { text: 'Título impactante' },
    text: { text: 'Texto descriptivo con información clave.' },
    image: { url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', alt: 'Imagen' },
    video: { url: 'https://www.youtube.com/embed/ysz5S6PUM-U' },
    cta: { label: 'Conocer más', url: 'https://example.com' },
    cards: { items: [{ title: 'Card 1', text: 'Valor diferencial' }, { title: 'Card 2', text: 'Caso de uso' }] },
    list: { items: ['Punto 1', 'Punto 2', 'Punto 3'] },
    stats: { items: [{ label: 'Clientes', value: '200+' }, { label: 'NPS', value: '72' }, { label: 'Países', value: '14' }] },
    chart: { title: 'Indicador', data: [{ label: 'A', value: 20 }, { label: 'B', value: 40 }, { label: 'C', value: 60 }] },
    comparison: { left: { title: 'Antes', points: ['Manual', 'Lento'] }, right: { title: 'Después', points: ['Automático', 'Ágil'] } },
    timeline: { items: [{ label: 'Paso 1', detail: 'Inicio' }, { label: 'Paso 2', detail: 'Iteración' }] },
    columns: { columns: [{ title: 'Columna A', text: 'Contenido' }, { title: 'Columna B', text: 'Contenido' }] },
  };

  return {
    ...base,
    content: defaults[type],
  };
};
