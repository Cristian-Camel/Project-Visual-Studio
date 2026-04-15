import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { Presentation, Slide, SlideElementType } from '../types/presentation';
import { createElement, createPresentation } from '../utils/defaults';
import { storage } from '../utils/storage';

interface StoreValue {
  presentations: Presentation[];
  activeId?: string;
  activeSlideId?: string;
  selectedElementId?: string;
  setActiveId: (id?: string) => void;
  setActiveSlideId: (id?: string) => void;
  setSelectedElementId: (id?: string) => void;
  createNewPresentation: () => void;
  duplicatePresentation: (id: string) => void;
  deletePresentation: (id: string) => void;
  updatePresentation: (id: string, updater: (p: Presentation) => Presentation) => void;
  addSlide: (presentationId: string) => void;
  reorderSlides: (presentationId: string, source: number, target: number) => void;
  addElement: (presentationId: string, slideId: string, type: SlideElementType) => void;
}

const PresentationContext = createContext<StoreValue | null>(null);

const touchUpdatedAt = (p: Presentation): Presentation => ({ ...p, updatedAt: new Date().toISOString() });

export const PresentationProvider = ({ children }: PropsWithChildren) => {
  const [presentations, setPresentations] = useState<Presentation[]>(() => storage.load());
  const [activeId, setActiveId] = useState<string | undefined>(presentations[0]?.id);
  const [activeSlideId, setActiveSlideId] = useState<string | undefined>(presentations[0]?.slides[0]?.id);
  const [selectedElementId, setSelectedElementId] = useState<string | undefined>();

  useEffect(() => {
    storage.save(presentations);
  }, [presentations]);

  const updatePresentation = (id: string, updater: (p: Presentation) => Presentation) => {
    setPresentations((prev) => prev.map((p) => (p.id === id ? touchUpdatedAt(updater(p)) : p)));
  };

  const createNewPresentation = () => {
    const newItem = createPresentation(`Presentación ${presentations.length + 1}`);
    setPresentations((prev) => [newItem, ...prev]);
    setActiveId(newItem.id);
    setActiveSlideId(newItem.slides[0].id);
    setSelectedElementId(undefined);
  };

  const duplicatePresentation = (id: string) => {
    const current = presentations.find((p) => p.id === id);
    if (!current) return;
    const clone: Presentation = JSON.parse(JSON.stringify(current));
    clone.id = crypto.randomUUID();
    clone.name = `${current.name} (copia)`;
    clone.createdAt = new Date().toISOString();
    clone.updatedAt = clone.createdAt;
    setPresentations((prev) => [clone, ...prev]);
  };

  const deletePresentation = (id: string) => {
    setPresentations((prev) => prev.filter((p) => p.id !== id));
    if (activeId === id) {
      const next = presentations.find((p) => p.id !== id);
      setActiveId(next?.id);
      setActiveSlideId(next?.slides[0]?.id);
      setSelectedElementId(undefined);
    }
  };

  const addSlide = (presentationId: string) => {
    updatePresentation(presentationId, (p) => {
      const slide: Slide = {
        id: crypto.randomUUID(),
        title: `Diapositiva ${p.slides.length + 1}`,
        transition: 'fade',
        background: { mode: 'color', value: '#FFFFFF' },
        elements: [],
      };
      setActiveSlideId(slide.id);
      return { ...p, slides: [...p.slides, slide] };
    });
  };

  const reorderSlides = (presentationId: string, source: number, target: number) => {
    if (source === target) return;
    updatePresentation(presentationId, (p) => {
      const slides = [...p.slides];
      const [item] = slides.splice(source, 1);
      slides.splice(target, 0, item);
      return { ...p, slides };
    });
  };

  const addElement = (presentationId: string, slideId: string, type: SlideElementType) => {
    updatePresentation(presentationId, (p) => ({
      ...p,
      slides: p.slides.map((slide) => {
        if (slide.id !== slideId) return slide;
        const element = createElement(type);
        setSelectedElementId(element.id);
        return { ...slide, elements: [...slide.elements, element] };
      }),
    }));
  };

  const value = useMemo(
    () => ({
      presentations,
      activeId,
      activeSlideId,
      selectedElementId,
      setActiveId,
      setActiveSlideId,
      setSelectedElementId,
      createNewPresentation,
      duplicatePresentation,
      deletePresentation,
      updatePresentation,
      addSlide,
      reorderSlides,
      addElement,
    }),
    [presentations, activeId, activeSlideId, selectedElementId],
  );

  return <PresentationContext.Provider value={value}>{children}</PresentationContext.Provider>;
};

export const usePresentationStore = () => {
  const ctx = useContext(PresentationContext);
  if (!ctx) throw new Error('usePresentationStore must be used within PresentationProvider');
  return ctx;
};
