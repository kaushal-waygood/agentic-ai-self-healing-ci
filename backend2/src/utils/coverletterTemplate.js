// src/utils/coverletterTemplate.js

export const COVER_LETTER_CSS = `
<style>
.cl-container {
    max-width: 800px;
    margin: 0 auto;
    font-family: "Times New Roman", serif;
    font-size: 11pt;
    line-height: 1.4;
    color: #000;
}

.cl-container p {
    margin-bottom: 10px;
}

.cl-header {
    margin-bottom: 16px;
}

@media print {
    body {
        margin: 0;
    }

    .cl-container {
        max-height: 277mm;
        overflow: hidden;
    }
}
</style>
`;

export function wrapCoverLetterHtml(bodyHtml, title = 'Cover Letter') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${title}</title>
${COVER_LETTER_CSS}
</head>
<body>
${bodyHtml}
</body>
</html>`;
}
