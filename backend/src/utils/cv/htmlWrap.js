// utils/cvTemplate.js
import { CV_TEMPLATES, DEFAULT_TEMPLATE } from './cssTemplates.js';

export const wrapCVHtml = (
  innerHtml,
  title,
  templateKey = DEFAULT_TEMPLATE,
) => {
  // 1. Validate template key, fallback to default if invalid
  const cssContent =
    CV_TEMPLATES[templateKey] || CV_TEMPLATES[DEFAULT_TEMPLATE];

  // 2. Return the complete HTML string
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    ${cssContent}
</head>
<body>
    ${innerHtml}
</body>
</html>`;
};
