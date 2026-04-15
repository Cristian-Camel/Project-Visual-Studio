import { MouseEvent, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BaseElement, Presentation, Slide } from '../../types/presentation';
import { ElementRenderer } from './ElementRenderer';
import { usePresentationStore } from '../../store/PresentationStore';

interface Props {
  presentation: Presentation;
  slide: Slide;
  isPreview?: boolean;
}

export const SlideCanvas = ({ presentation, slide, isPreview = false }: Props) => {
  const { selectedElementId, setSelectedElementId, updatePresentation } = usePresentationStore();
  const [drag, setDrag] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [resizeId, setResizeId] = useState<string | null>(null);

  const style = useMemo(() => {
    if (slide.background.mode === 'image') return { backgroundImage: `url(${slide.background.value})`, backgroundSize: 'cover' };
    if (slide.background.mode === 'gradient') return { background: slide.background.value };
    return { background: slide.background.value };
  }, [slide.background]);

  const updateElement = (elementId: string, updater: (el: BaseElement) => BaseElement) => {
    updatePresentation(presentation.id, (p) => ({
      ...p,
      slides: p.slides.map((s) =>
        s.id === slide.id
          ? {
              ...s,
              elements: s.elements.map((el) => (el.id === elementId ? updater(el) : el)),
            }
          : s,
      ),
    }));
  };

  const onPointerDown = (event: MouseEvent<HTMLDivElement>, element: BaseElement) => {
    if (isPreview) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setDrag({ id: element.id, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top });
    setSelectedElementId(element.id);
  };

  const onMove = (event: MouseEvent<HTMLDivElement>) => {
    if (isPreview) return;
    const canvasRect = event.currentTarget.getBoundingClientRect();
    if (drag) {
      updateElement(drag.id, (el) => ({
        ...el,
        position: {
          ...el.position,
          x: Math.max(0, Math.min(canvasRect.width - el.position.width, event.clientX - canvasRect.left - drag.offsetX)),
          y: Math.max(0, Math.min(canvasRect.height - el.position.height, event.clientY - canvasRect.top - drag.offsetY)),
        },
      }));
    }
    if (resizeId) {
      updateElement(resizeId, (el) => ({
        ...el,
        position: {
          ...el.position,
          width: Math.max(100, event.clientX - canvasRect.left - el.position.x),
          height: Math.max(60, event.clientY - canvasRect.top - el.position.y),
        },
      }));
    }
  };

  const clearActions = () => {
    setDrag(null);
    setResizeId(null);
  };

  return (
    <div className="w-full overflow-auto rounded-2xl border border-slate-200 bg-slate-100 p-6">
      <div
        role="presentation"
        className="relative mx-auto h-[600px] w-[1120px] overflow-hidden rounded-2xl shadow-2xl"
        style={style}
        onMouseMove={onMove}
        onMouseUp={clearActions}
        onMouseLeave={clearActions}
      >
        {slide.elements.map((element) => {
          if (element.hidden) return null;
          const selected = selectedElementId === element.id;
          const editableText = ['title', 'text'].includes(element.type);

          return (
            <motion.div
              key={element.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`absolute rounded-lg ${selected ? 'ring-2 ring-blue-500' : ''}`}
              style={{
                left: element.position.x,
                top: element.position.y,
                width: element.position.width,
                height: element.position.height,
              }}
              onMouseDown={(e) => onPointerDown(e, element)}
              onClick={() => setSelectedElementId(element.id)}
            >
              {editableText && !isPreview ? (
                <div
                  suppressContentEditableWarning
                  contentEditable
                  className="h-full w-full rounded p-2 text-slate-900"
                  onBlur={(e) =>
                    updateElement(element.id, (el) => ({ ...el, content: { ...el.content, text: e.currentTarget.innerText } }))
                  }
                >
                  {String(element.content.text ?? '')}
                </div>
              ) : (
                <ElementRenderer element={element} preview={isPreview} />
              )}
              {selected && !isPreview && (
                <button
                  className="absolute -bottom-2 -right-2 h-4 w-4 rounded-full bg-blue-500"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setResizeId(element.id);
                  }}
                  aria-label="Resize element"
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
