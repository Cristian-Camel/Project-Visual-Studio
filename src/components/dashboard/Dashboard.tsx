import { Copy, Pencil, Plus, Trash2 } from 'lucide-react';
import { usePresentationStore } from '../../store/PresentationStore';
import { Button } from '../ui/Button';
import { Panel } from '../ui/Panel';

interface Props {
  onOpenEditor: () => void;
}

export const Dashboard = ({ onOpenEditor }: Props) => {
  const { presentations, setActiveId, setActiveSlideId, createNewPresentation, duplicatePresentation, deletePresentation } =
    usePresentationStore();

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Visual Studio Presentations</h1>
            <p className="text-slate-600">Dashboard de proyectos recientes y plantillas.</p>
          </div>
          <Button
            onClick={() => {
              createNewPresentation();
              onOpenEditor();
            }}
            className="inline-flex items-center gap-2"
          >
            <Plus size={16} /> Nueva presentación
          </Button>
        </header>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {presentations.map((project) => (
            <Panel key={project.id}>
              <h2 className="text-lg font-semibold text-slate-900">{project.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{project.description}</p>
              <p className="mt-2 text-xs text-slate-400">Actualizado: {new Date(project.updatedAt).toLocaleString()}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  className="inline-flex items-center gap-1"
                  onClick={() => {
                    setActiveId(project.id);
                    setActiveSlideId(project.slides[0]?.id);
                    onOpenEditor();
                  }}
                >
                  <Pencil size={14} /> Editar
                </Button>
                <Button variant="ghost" className="inline-flex items-center gap-1" onClick={() => duplicatePresentation(project.id)}>
                  <Copy size={14} /> Duplicar
                </Button>
                <Button variant="danger" className="inline-flex items-center gap-1" onClick={() => deletePresentation(project.id)}>
                  <Trash2 size={14} /> Eliminar
                </Button>
              </div>
            </Panel>
          ))}
        </div>
      </div>
    </main>
  );
};
