// src/utils/coverletter.htmlify.js
// Convert model output (plain text or fragment HTML) into a single, styled HTML snippet.
// Includes full HTML document wrapper with <title>.

const sanitize = (str) => {
  if (!str) return '';
  return (
    String(str)
      // remove script tags entirely
      .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
      // remove inline event handlers like onclick="..."
      .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
      .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
  );
};

const isHtmlFragment = (s) => {
  if (!s) return false;
  return /<\/?[a-z][\s\S]*>/i.test(s);
};

const textToParagraphs = (text) => {
  const clean = text.trim();
  if (!clean) return [];
  const paras = clean
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  return paras.map((p) => p.replace(/\n/g, '<br>'));
};

// Helper: format date like "12 Nov., 2025"
const formatPrettyDate = () => {
  const d = new Date();
  const day = d.getDate();
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = d.getFullYear();
  return `${day} ${month}., ${year}`;
};

// Helper: escape HTML entities
function escapeHtml(unsafe) {
  if (unsafe === undefined || unsafe === null) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Wraps inner HTML body in a complete HTML document for proper display in browser tabs
const wrapInHtmlDocument = (innerHtml, title = 'Cover Letter - Zobsai') => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(title)}</title>
</head>
<body>
${innerHtml}
</body>
</html>
`.trim();
};

export const convertToStyledHtml = (aiRaw = '', profile = {}, opts = {}) => {
  const raw = String(aiRaw || '');
  const safe = sanitize(raw);
  const themeColor = opts.themeColor || '#0f172a';
  const accent = opts.accent || '#2563eb';
  const fontFamily = opts.fontFamily || 'Inter, Roboto, Arial, sans-serif';

  const name = profile.fullName || '';
  const email = profile.email || '';
  const phone = profile.phone || '';

  const contactLines = [];
  if (name)
    contactLines.push(`<strong class="c-name">${escapeHtml(name)}</strong>`);
  if (phone)
    contactLines.push(`<span class="c-phone">${escapeHtml(phone)}</span>`);
  if (email)
    contactLines.push(
      `<a class="c-email" href="mailto:${escapeHtml(email)}">${escapeHtml(
        email,
      )}</a>`,
    );

  const contactHtml = contactLines.length
    ? `<p class="contact">${contactLines.join(' &nbsp; | &nbsp; ')}</p>`
    : '';

  let bodyHtml = '';
  if (isHtmlFragment(safe)) {
    // If AI returned some HTML, take it as-is but stripped of dangerous bits
    bodyHtml = safe;
  } else {
    const paras = textToParagraphs(safe);
    bodyHtml = paras.map((p) => `<p>${p}</p>`).join('\n');
  }

  const innerHtml = `
<div class="cl-root" style="font-family: ${fontFamily}; color: ${themeColor}; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 22px;">
  <style>
    .cl-root { box-sizing: border-box; }
    .cl-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
    .contact { margin: 0 0 10px 0; color: ${themeColor}; font-size: 14px; }
    .c-name { font-size: 20px; color: ${themeColor}; }
    .c-email { color: ${accent}; text-decoration: none; }
    .cl-date { color: #6b7280; font-size: 13px; margin-bottom: 10px; }
    .cl-body p { margin: 10px 0; font-size: 15px; }
    .cl-footer { margin-top: 18px; }
    .cl-sign { margin-top: 12px; font-weight: 600; }
    @media (max-width: 640px) {
      .cl-root { padding: 16px; }
    }
  </style>

  <div class="cl-body">${bodyHtml}</div>

  <div class="cl-footer">
    <div class="cl-sign">Sincerely,</div>
    <div>${escapeHtml(name)}</div>
  </div>
</div>
`.trim();

  // Build the final HTML document with a dynamic title
  const titleText = name ? `Cover Letter - ${name}` : 'Cover Letter - Zobsai';
  return wrapInHtmlDocument(innerHtml, titleText);
};
