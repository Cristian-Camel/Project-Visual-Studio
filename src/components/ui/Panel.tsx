import { PropsWithChildren } from 'react';

export const Panel = ({ children }: PropsWithChildren) => (
  <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">{children}</section>
);
