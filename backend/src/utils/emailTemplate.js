export const EMAIL_CSS = `
<style>
.email-container {
  max-width: 700px;
  margin: 0 auto;
  font-family: "Times New Roman", serif;
  font-size: 11pt;
  line-height: 1.5;
  color: #000;
}

.email-subject {
  font-weight: bold;
  margin-bottom: 16px;
}

.email-body p {
  margin-bottom: 12px;
}

.email-signature {
  margin-top: 16px;
  font-weight: bold;
}
</style>
`;

export function wrapEmailHtml(subject, bodyText, name = '') {
  const paragraphs = bodyText
    .split('\n\n')
    .map((p) => `<p>${p.trim()}</p>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Email</title>
${EMAIL_CSS}
</head>
<body>
  <div class="email-container">
    <div class="email-subject">${subject}</div>
    <div class="email-body">
      ${paragraphs}
    </div>
    ${name ? `<div class="email-signature">${name}</div>` : ''}
  </div>
</body>
</html>`;
}

/**
 * Simple HTML for email draft editor — no full document, no embedded CSS.
 * Just body paragraphs + signature for clean editing.
 */
export function wrapEmailDraftHtml(bodyText, name = '') {
  const paragraphs = bodyText
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join('');

  const parts = [paragraphs];
  if (name) parts.push(`<p><strong>${escapeHtml(name)}</strong></p>`);
  return parts.join('');
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
