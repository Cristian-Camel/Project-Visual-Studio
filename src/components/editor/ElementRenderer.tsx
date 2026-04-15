import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { BaseElement } from '../../types/presentation';

interface Props {
  element: BaseElement;
  preview?: boolean;
}

export const ElementRenderer = ({ element, preview = false }: Props) => {
  const textCls = preview ? 'text-white' : 'text-slate-900';
  switch (element.type) {
    case 'title':
      return <h2 className={`text-4xl font-bold ${textCls}`}>{String(element.content.text ?? 'Título')}</h2>;
    case 'text':
      return <p className={`text-lg leading-relaxed ${textCls}`}>{String(element.content.text ?? '')}</p>;
    case 'image':
      return <img className="h-full w-full rounded-xl object-cover" src={String(element.content.url ?? '')} alt={String(element.content.alt ?? '')} />;
    case 'video':
      return <iframe className="h-full w-full rounded-xl" src={String(element.content.url ?? '')} title="Video" allowFullScreen />;
    case 'cta':
      return (
        <a className="inline-flex h-full w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-lg font-semibold text-white" href={String(element.content.url ?? '#')}>
          {String(element.content.label ?? 'CTA')}
        </a>
      );
    case 'cards': {
      const items = (element.content.items as Array<{ title: string; text: string }>) ?? [];
      return (
        <div className="grid h-full grid-cols-2 gap-3">
          {items.map((item) => (
            <article key={item.title} className="rounded-xl bg-white/90 p-3 shadow">
              <h4 className="font-semibold text-slate-900">{item.title}</h4>
              <p className="text-sm text-slate-600">{item.text}</p>
            </article>
          ))}
        </div>
      );
    }
    case 'list': {
      const items = (element.content.items as string[]) ?? [];
      return <ul className={`list-disc space-y-2 pl-5 text-lg ${textCls}`}>{items.map((it) => <li key={it}>{it}</li>)}</ul>;
    }
    case 'stats': {
      const items = (element.content.items as Array<{ label: string; value: string }>) ?? [];
      return (
        <div className="grid h-full grid-cols-3 gap-4">
          {items.map((item) => (
            <article key={item.label} className="rounded-xl bg-white/90 p-4 text-center shadow">
              <p className="text-3xl font-bold text-blue-600">{item.value}</p>
              <p className="text-sm text-slate-700">{item.label}</p>
            </article>
          ))}
        </div>
      );
    }
    case 'chart': {
      const data = (element.content.data as Array<{ label: string; value: number }>) ?? [];
      return (
        <div className="h-full w-full rounded-xl bg-white/90 p-3">
          <p className="mb-2 text-sm font-semibold text-slate-700">{String(element.content.title ?? 'Chart')}</p>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }
    case 'comparison': {
      const left = (element.content.left as { title: string; points: string[] }) ?? { title: 'Antes', points: [] };
      const right = (element.content.right as { title: string; points: string[] }) ?? { title: 'Después', points: [] };
      return (
        <div className="grid h-full grid-cols-2 gap-4">
          {[left, right].map((side) => (
            <article key={side.title} className="rounded-xl bg-white/90 p-4 shadow">
              <h4 className="font-semibold text-slate-900">{side.title}</h4>
              <ul className="mt-2 list-disc pl-4 text-sm text-slate-700">{side.points.map((point) => <li key={point}>{point}</li>)}</ul>
            </article>
          ))}
        </div>
      );
    }
    case 'timeline': {
      const items = (element.content.items as Array<{ label: string; detail: string }>) ?? [];
      return (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={item.label} className="flex items-start gap-3">
              <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{i + 1}</div>
              <div>
                <p className={`font-semibold ${textCls}`}>{item.label}</p>
                <p className={`text-sm ${preview ? 'text-slate-200' : 'text-slate-600'}`}>{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      );
    }
    case 'columns': {
      const columns = (element.content.columns as Array<{ title: string; text: string }>) ?? [];
      return (
        <div className="grid h-full grid-cols-2 gap-4">
          {columns.map((col) => (
            <article key={col.title} className="rounded-xl bg-white/90 p-4 shadow">
              <h4 className="font-semibold text-slate-900">{col.title}</h4>
              <p className="text-sm text-slate-700">{col.text}</p>
            </article>
          ))}
        </div>
      );
    }
    default:
      return null;
  }
};
