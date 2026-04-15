import { Presentation } from '../types/presentation';

const now = new Date().toISOString();

export const demoPresentation: Presentation = {
  id: 'demo-presentation',
  name: 'Launch 2026 · Plataforma Interactiva',
  description: 'Demo comercial con bloques, multimedia y gráficos.',
  themeId: 'aurora',
  createdAt: now,
  updatedAt: now,
  slides: [
    {
      id: crypto.randomUUID(),
      title: 'Portada',
      transition: 'fade',
      background: { mode: 'gradient', value: 'linear-gradient(135deg,#2563eb,#7c3aed)' },
      elements: [
        {
          id: crypto.randomUUID(),
          type: 'title',
          position: { x: 80, y: 100, width: 860, height: 90 },
          content: { text: 'Presentaciones Dinámicas para Equipos de Alto Impacto' },
          animation: 'slide-up',
        },
        {
          id: crypto.randomUUID(),
          type: 'text',
          position: { x: 80, y: 220, width: 700, height: 90 },
          content: { text: 'Diseña, anima y presenta historias visuales sin fricción técnica.' },
          animation: 'fade',
        },
        {
          id: crypto.randomUUID(),
          type: 'cta',
          position: { x: 80, y: 360, width: 260, height: 60 },
          content: { label: 'Solicitar demo enterprise', url: 'https://example.com' },
          animation: 'scale',
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      title: 'Métricas',
      transition: 'slide',
      background: { mode: 'color', value: '#F8FAFC' },
      elements: [
        {
          id: crypto.randomUUID(),
          type: 'stats',
          position: { x: 60, y: 80, width: 980, height: 180 },
          content: {
            items: [
              { label: 'Conversión', value: '34%' },
              { label: 'Tiempo ahorro', value: '12h/sem' },
              { label: 'Engagement', value: '+48%' },
            ],
          },
        },
        {
          id: crypto.randomUUID(),
          type: 'chart',
          position: { x: 60, y: 290, width: 980, height: 280 },
          content: {
            title: 'Crecimiento trimestral',
            data: [
              { label: 'Q1', value: 18 },
              { label: 'Q2', value: 30 },
              { label: 'Q3', value: 45 },
              { label: 'Q4', value: 62 },
            ],
          },
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      title: 'Roadmap',
      transition: 'zoom',
      background: { mode: 'image', value: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=80' },
      elements: [
        {
          id: crypto.randomUUID(),
          type: 'timeline',
          position: { x: 70, y: 80, width: 900, height: 370 },
          content: {
            items: [
              { label: 'MVP', detail: 'Editor y modo presentación listos.' },
              { label: 'Q2', detail: 'Colaboración en tiempo real.' },
              { label: 'Q3', detail: 'IA para generación de slides.' },
              { label: 'Q4', detail: 'Analytics y publicación avanzada.' },
            ],
          },
        },
        {
          id: crypto.randomUUID(),
          type: 'video',
          position: { x: 760, y: 120, width: 300, height: 220 },
          content: { url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        },
      ],
    },
  ],
};
