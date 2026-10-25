import content from './checklist.json';

export const checklistPdfUrl = `${import.meta.env.BASE_URL}downloads/case-preparation-checklist.pdf`;
export const checklist = [
  content.title,
  content.subtitle,
  ...content.sections.map(section => `${section.title}\n${section.items.map(item => `[ ] ${item.lead} ${item.text}`).join('\n')}`),
  content.footer,
].join('\n\n');
