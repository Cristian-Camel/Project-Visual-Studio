import { useMemo, useState } from 'react';
import { TopBar } from './TopBar';
import { SlidesPanel } from './SlidesPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { SlideCanvas } from './SlideCanvas';
import { usePresentationStore } from '../../store/PresentationStore';
import { exportAsHtml, exportAsJson } from '../../utils/exporters';
import { createElement } from '../../utils/defaults';
import { PresentationPlayer } from '../presentation/PresentationPlayer';

interface Props {
  onBack: () => void;
}

export const Editor = ({ onBack }: Props) => {
  const {
    presentations,
    activeId,
    activeSlideId,
    selectedElementId,
    setActiveSlideId,
    updatePresentation,
    addSlide,
    reorderSlides,
    addElement,
  } = usePresentationStore();
  const [showPreview, setShowPreview] = useState(false);
  const [showPresent, setShowPresent] = useState(false);

  const presentation = presentations.find((p) => p.id === activeId) ?? presentations[0];
  const slide = presentation.slides.find((s) => s.id === activeSlideId) ?? presentation.slides[0];
  const selected = slide.elements.find((e) => e.id === selectedElementId);

  const selectedInfo = selected
    ? {
        id: selected.id,
        type: selected.type,
        x: selected.position.x,
        y: selected.position.y,
        width: selected.position.width,
        height: selected.position.height,
        hidden: selected.hidden,
      }
    : undefined;

  const applyOnSelected = (updater: (prev: typeof selected) => typeof selected) => {
    if (!selected) return;
    updatePresentation(presentation.id, (p) => ({
      ...p,
      slides: p.slides.map((s) =>
        s.id === slide.id
          ? { ...s, elements: s.elements.map((el) => (el.id === selected.id ? (updater(el) as typeof el) : el)) }
          : s,
      ),
    }));
  };

  const distribute = () => {
    updatePresentation(presentation.id, (p) => ({
      ...p,
      slides: p.slides.map((s) => {
        if (s.id !== slide.id || s.elements.length < 2) return s;
        const gap = 920 / (s.elements.length + 1);
        return {
          ...s,
          elements: s.elements.map((el, i) => ({ ...el, position: { ...el.position, x: gap * (i + 1) } })),
        };
      }),
    }));
  };

  const paletteStyle = useMemo(() => {
    const theme = ['aurora', 'corporate', 'midnight'].includes(presentation.themeId) ? presentation.themeId : 'aurora';
    return theme === 'midnight' ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900';
  }, [presentation.themeId]);

  return (
    <main className={`h-screen w-screen ${paletteStyle}`}>
      <TopBar
        title={presentation.name}
        themeId={presentation.themeId}
        onBack={onBack}
        onThemeChange={(themeId) => updatePresentation(presentation.id, (p) => ({ ...p, themeId }))}
        onPreview={() => setShowPreview(true)}
        onPresent={() => setShowPresent(true)}
        onExportJson={() => exportAsJson(presentation)}
        onExportHtml={() => exportAsHtml(presentation)}
      />
      <div className="flex h-[calc(100vh-57px)]">
        <SlidesPanel
          slides={presentation.slides}
          activeSlideId={slide.id}
          onSelect={setActiveSlideId}
          onAdd={() => addSlide(presentation.id)}
          onReorder={(source, target) => reorderSlides(presentation.id, source, target)}
        />
        <div className="flex-1 p-4">
          <SlideCanvas presentation={presentation} slide={slide} />
        </div>
        <PropertiesPanel
          selected={selectedInfo}
          onAddElement={(type) => addElement(presentation.id, slide.id, type)}
          onUpdatePosition={(patch) =>
            applyOnSelected((el) =>
              el
                ? {
                    ...el,
                    position: {
                      ...el.position,
                      ...patch,
                    },
                  }
                : el,
            )
          }
          onDuplicate={() =>
            selected &&
            updatePresentation(presentation.id, (p) => ({
              ...p,
              slides: p.slides.map((s) =>
                s.id === slide.id
                  ? { ...s, elements: [...s.elements, { ...createElement(selected.type), content: selected.content }] }
                  : s,
              ),
            }))
          }
          onHide={() => applyOnSelected((el) => (el ? { ...el, hidden: !el.hidden } : el))}
          onDelete={() =>
            selected &&
            updatePresentation(presentation.id, (p) => ({
              ...p,
              slides: p.slides.map((s) =>
                s.id === slide.id ? { ...s, elements: s.elements.filter((el) => el.id !== selected.id) } : s,
              ),
            }))
          }
          onAlignCenter={() =>
            applyOnSelected((el) =>
              el ? { ...el, position: { ...el.position, x: 560 - el.position.width / 2, y: 300 - el.position.height / 2 } } : el,
            )
          }
          onDistribute={distribute}
        />
      </div>
      {showPreview && (
        <div className="fixed inset-0 z-40 bg-black/70 p-8" onClick={() => setShowPreview(false)}>
          <div className="mx-auto max-w-[1200px]" onClick={(e) => e.stopPropagation()}>
            <SlideCanvas presentation={presentation} slide={slide} isPreview />
          </div>
        </div>
      )}
      {showPresent && <PresentationPlayer presentation={presentation} onExit={() => setShowPresent(false)} />}
    </main>
  );
};
