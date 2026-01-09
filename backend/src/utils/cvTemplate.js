import { CV_TEMPLATES } from './cv/cssTemplates.js';

export function wrapCVHtml(
  bodyHtml,
  { title = 'Resume', template = 'classic' } = {},
) {
  const css = CV_TEMPLATES[template] || CV_TEMPLATES.classic;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${title}</title>
<style>${css}</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

export const AVAILABLE_CV_TEMPLATES = Object.keys(CV_TEMPLATES);
