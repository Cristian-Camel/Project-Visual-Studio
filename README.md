# Visual Studio Presentations (MVP)

Plataforma web para crear, editar y presentar presentaciones dinámicas, modernas e interactivas con arquitectura lista para evolucionar a SaaS.

## 1) Arquitectura propuesta

### Capas
- **UI Layer (`src/components`)**: Dashboard, Editor, Player de presentación y componentes reutilizables.
- **Application Layer (`src/app`)**: orquesta modos de pantalla.
- **State Layer (`src/store`)**: contexto central con acciones de dominio (crear, editar, duplicar, eliminar, ordenar, insertar bloques).
- **Domain (`src/types`)**: modelo serializable de presentaciones/diapositivas/elementos.
- **Infrastructure (`src/utils`, `src/data`)**: persistencia localStorage, exportadores JSON/HTML, temas y demo pre-cargada.

### Decisiones técnicas
- **React + TypeScript + Vite** para rapidez de iteración y mantenibilidad.
- **Tailwind CSS** para diseño consistente y moderno.
- **Framer Motion** para transiciones suaves.
- **Recharts** para gráficos simples.
- **Persistencia localStorage** con estructura preparada para cambiar a API REST/GraphQL (mismo contrato de `Presentation`).

## 2) Estructura de carpetas

```txt
.
├── src
│   ├── app
│   │   └── App.tsx
│   ├── components
│   │   ├── dashboard
│   │   │   └── Dashboard.tsx
│   │   ├── editor
│   │   │   ├── Editor.tsx
│   │   │   ├── ElementRenderer.tsx
│   │   │   ├── PropertiesPanel.tsx
│   │   │   ├── SlideCanvas.tsx
│   │   │   ├── SlidesPanel.tsx
│   │   │   └── TopBar.tsx
│   │   ├── presentation
│   │   │   └── PresentationPlayer.tsx
│   │   └── ui
│   │       ├── Button.tsx
│   │       └── Panel.tsx
│   ├── data
│   │   ├── demoPresentation.ts
│   │   └── themes.ts
│   ├── store
│   │   └── PresentationStore.tsx
│   ├── types
│   │   └── presentation.ts
│   ├── utils
│   │   ├── defaults.ts
│   │   ├── exporters.ts
│   │   └── storage.ts
│   ├── main.tsx
│   └── styles.css
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── vite.config.ts
└── package.json
```

## 3) Funcionalidades MVP implementadas

### Dashboard
- Crear presentación.
- Duplicar presentación.
- Eliminar presentación.
- Listado de proyectos recientes.

### Editor
- Panel lateral con miniaturas.
- Reordenamiento de diapositivas con drag and drop nativo.
- Lienzo central editable.
- Panel de propiedades.
- Barra superior con preview/presentar/exportar.

### Elementos soportados
- Título, texto, imagen, video embebido, CTA, cards, listas, stats, chart, comparación, timeline, columnas.

### Interacciones
- Drag and drop para mover elementos dentro de diapositiva.
- Redimensionado mediante handle.
- Edición inline para título/texto.
- Duplicar/ocultar/eliminar elemento.
- Alinear al centro y distribuir elementos.

### Temas
- 3 temas prediseñados (`aurora`, `corporate`, `midnight`).
- Cambio de tema global por presentación.

### Modo presentación
- Vista limpia en fullscreen app-level.
- Navegación por teclado (←, →, Esc).
- Indicador de progreso.
- Transiciones suaves.

### Persistencia y exportación
- Auto-guardado local (localStorage).
- Demo inicial cargada automáticamente.
- Exportación a JSON y HTML.

## 4) Cómo correr el proyecto

```bash
npm install
npm run dev
```

Build de producción:

```bash
npm run build
npm run preview
```

## 5) Demo incluida

Se incluye `demoPresentation` con varias diapositivas y mezcla de bloques (portada, métricas con gráfico, roadmap con timeline + video) para demo comercial inmediata.

## 6) Mejoras futuras

- Modo oscuro completo con tokens de tema.
- Atajos de teclado avanzados y command palette.
- Sistema de plantillas y biblioteca de bloques reutilizables.
- Exportación PDF/server-side rendering.
- Colaboración en tiempo real (WebSocket/CRDT).
- Motor de IA para generar slides desde brief.
- Historial/undo-redo, comentarios y analítica de visualización.
