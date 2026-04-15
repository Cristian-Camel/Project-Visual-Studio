import { AlignCenter, AlignHorizontalSpaceAround, Copy, EyeOff, Plus, Trash2 } from 'lucide-react';
import { SlideElementType } from '../../types/presentation';
import { Button } from '../ui/Button';

const INSERT_TYPES: SlideElementType[] = [
  'title',
  'text',
  'image',
  'video',
  'cta',
  'cards',
  'list',
  'stats',
  'chart',
  'comparison',
  'timeline',
  'columns',
];

interface Props {
  selected?: {
    id: string;
    type: SlideElementType;
    x: number;
    y: number;
    width: number;
    height: number;
    hidden?: boolean;
  };
  onAddElement: (type: SlideElementType) => void;
  onUpdatePosition: (patch: Partial<{ x: number; y: number; width: number; height: number }>) => void;
  onDuplicate: () => void;
  onHide: () => void;
  onDelete: () => void;
  onAlignCenter: () => void;
  onDistribute: () => void;
}

export const PropertiesPanel = ({
  selected,
  onAddElement,
  onUpdatePosition,
  onDuplicate,
  onHide,
  onDelete,
  onAlignCenter,
  onDistribute,
}: Props) => (
  <aside className="w-80 space-y-4 overflow-auto border-l border-slate-200 bg-white p-3">
    <section>
      <h3 className="mb-2 text-sm font-semibold text-slate-700">Insertar bloque</h3>
      <div className="grid grid-cols-2 gap-2">
        {INSERT_TYPES.map((type) => (
          <Button key={type} variant="ghost" className="justify-start text-xs" onClick={() => onAddElement(type)}>
            <Plus size={12} /> {type}
          </Button>
        ))}
      </div>
    </section>

    <section className="space-y-2">
      <h3 className="text-sm font-semibold text-slate-700">Propiedades</h3>
      {!selected ? (
        <p className="text-sm text-slate-500">Selecciona un elemento para editar.</p>
      ) : (
        <>
          <p className="text-xs uppercase tracking-wide text-slate-500">Elemento: {selected.type}</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {(['x', 'y', 'width', 'height'] as const).map((key) => (
              <label key={key} className="space-y-1">
                <span className="text-xs text-slate-500">{key}</span>
                <input
                  type="number"
                  className="w-full rounded border border-slate-300 px-2 py-1"
                  value={Math.round(selected[key])}
                  onChange={(e) => onUpdatePosition({ [key]: Number(e.target.value) })}
                />
              </label>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="ghost" className="inline-flex items-center gap-1" onClick={onAlignCenter}>
              <AlignCenter size={14} /> Centrar
            </Button>
            <Button variant="ghost" className="inline-flex items-center gap-1" onClick={onDistribute}>
              <AlignHorizontalSpaceAround size={14} /> Distribuir
            </Button>
            <Button variant="ghost" className="inline-flex items-center gap-1" onClick={onDuplicate}>
              <Copy size={14} /> Duplicar
            </Button>
            <Button variant="ghost" className="inline-flex items-center gap-1" onClick={onHide}>
              <EyeOff size={14} /> {selected.hidden ? 'Mostrar' : 'Ocultar'}
            </Button>
            <Button variant="danger" className="col-span-2 inline-flex items-center justify-center gap-1" onClick={onDelete}>
              <Trash2 size={14} /> Eliminar elemento
            </Button>
          </div>
        </>
      )}
    </section>
  </aside>
);
