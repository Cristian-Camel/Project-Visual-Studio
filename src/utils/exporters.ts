import { Presentation } from '../types/presentation';

const downloadBlob = (filename: string, content: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportAsJson = (presentation: Presentation) => {
  downloadBlob(`${presentation.name}.json`, JSON.stringify(presentation, null, 2), 'application/json');
};

export const exportAsHtml = (presentation: Presentation) => {
  const slides = presentation.slides
    .map(
      (slide, index) => `
<section style="width:100vw;height:100vh;padding:40px;background:${slide.background.value};">
<h2>${index + 1}. ${slide.title}</h2>
${slide.elements
  .map((element) => `<article style="margin:12px 0;padding:8px 12px;border:1px solid #ddd;border-radius:8px;"><strong>${element.type}</strong><pre>${JSON.stringify(element.content, null, 2)}</pre></article>`)
  .join('')}
</section>`,
    )
    .join('');

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>${presentation.name}</title></head><body style="margin:0;font-family:Inter,sans-serif;">${slides}</body></html>`;
  downloadBlob(`${presentation.name}.html`, html, 'text/html');
};
