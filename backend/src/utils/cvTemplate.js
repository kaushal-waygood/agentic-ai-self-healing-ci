import { CV_TEMPLATES } from './cv/cssTemplates.js';

/**
 * Wraps CV/Resume body HTML with full document, title, and template styles.
 * Accepts both signatures for backward compatibility:
 *   wrapCVHtml(bodyHtml, { title, template })
 *   wrapCVHtml(bodyHtml, title, template)
 */
export function wrapCVHtml(bodyHtml, titleOrOptions, templateArg) {
  let title = 'Resume';
  let template = 'classic';

  if (typeof titleOrOptions === 'object' && titleOrOptions !== null) {
    title = titleOrOptions.title ?? title;
    template = titleOrOptions.template ?? template;
  } else if (typeof titleOrOptions === 'string') {
    title = titleOrOptions;
    template = templateArg ?? template;
  }

  const css = CV_TEMPLATES[template] || CV_TEMPLATES.classic;
  const styleContent =
    typeof css === 'string' && css.trim().startsWith('<style')
      ? css
      : `<style>${css}</style>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
${styleContent}
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

export const AVAILABLE_CV_TEMPLATES = Object.keys(CV_TEMPLATES);
