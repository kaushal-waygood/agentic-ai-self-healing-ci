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
