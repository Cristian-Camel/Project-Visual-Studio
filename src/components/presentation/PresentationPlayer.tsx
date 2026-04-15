import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Presentation } from '../../types/presentation';
import { SlideCanvas } from '../editor/SlideCanvas';
import { Button } from '../ui/Button';

interface Props {
  presentation: Presentation;
  onExit: () => void;
}

export const PresentationPlayer = ({ presentation, onExit }: Props) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') setIndex((v) => Math.min(v + 1, presentation.slides.length - 1));
      if (event.key === 'ArrowLeft') setIndex((v) => Math.max(v - 1, 0));
      if (event.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onExit, presentation.slides.length]);

  const progress = ((index + 1) / presentation.slides.length) * 100;

  return (
    <main className="fixed inset-0 z-50 bg-black p-6">
      <div className="mb-3 flex items-center justify-between text-white">
        <p>
          {index + 1}/{presentation.slides.length} · {presentation.slides[index].title}
        </p>
        <Button variant="ghost" className="border-slate-600 text-white hover:bg-slate-800" onClick={onExit}>
          Salir (Esc)
        </Button>
      </div>
      <div className="h-1 w-full rounded-full bg-slate-700">
        <div className="h-full rounded-full bg-blue-400" style={{ width: `${progress}%` }} />
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={presentation.slides[index].id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <SlideCanvas presentation={presentation} slide={presentation.slides[index]} isPreview />
        </motion.div>
      </AnimatePresence>
    </main>
  );
};
