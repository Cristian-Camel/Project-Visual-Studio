import { demoPresentation } from '../data/demoPresentation';
import { Presentation } from '../types/presentation';

const STORAGE_KEY = 'vsp.presentations.v1';

export const storage = {
  load(): Presentation[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([demoPresentation]));
      return [demoPresentation];
    }

    try {
      const parsed = JSON.parse(raw) as Presentation[];
      return parsed.length ? parsed : [demoPresentation];
    } catch {
      return [demoPresentation];
    }
  },
  save(data: Presentation[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },
};
