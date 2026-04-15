import { GripVertical, Plus } from 'lucide-react';
import { Slide } from '../../types/presentation';
import { Button } from '../ui/Button';

interface Props {
  slides: Slide[];
  activeSlideId?: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onReorder: (source: number, target: number) => void;
}

export const SlidesPanel = ({ slides, activeSlideId, onSelect, onAdd, onReorder }: Props) => {
  return (
    <aside className="w-72 space-y-3 overflow-auto border-r border-slate-200 bg-white p-3">
      <Button className="w-full inline-flex items-center justify-center gap-2" onClick={onAdd}>
        <Plus size={14} /> Añadir diapositiva
      </Button>
      {slides.map((slide, index) => (
        <article
          key={slide.id}
          draggable
          onDragStart={(e) => e.dataTransfer.setData('sourceIndex', String(index))}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            const source = Number(e.dataTransfer.getData('sourceIndex'));
            onReorder(source, index);
          }}
          className={`cursor-pointer rounded-xl border p-2 ${activeSlideId === slide.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}
          onClick={() => onSelect(slide.id)}
        >
          <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
            <span>Slide {index + 1}</span>
            <GripVertical size={12} />
          </div>
          <div className="h-20 rounded-lg bg-slate-100 p-2 text-xs font-semibold text-slate-700">{slide.title}</div>
        </article>
      ))}
    </aside>
  );
};
