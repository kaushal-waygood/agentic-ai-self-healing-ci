// services/pdfEmailService.js
import puppeteer from 'puppeteer';

// ─── PDF Generation ───────────────────────────────────────────────────────────

const buildFullHtml = (html, documentType) => {
  if (html.includes('<html')) return html;

  const normalizedType = String(documentType || 'document').toLowerCase();
  const coverLetterStyles =
    normalizedType === 'coverletter'
      ? `
      .resume-isolation-container { font-size: 16px; line-height: 1.55; }
      .resume-isolation-container p { margin: 0 0 1.25rem; }
      .resume-isolation-container p:last-child { margin-bottom: 0; }
    `
      : '';

  return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
        <style>
          html, body { margin: 0; padding: 0; background: #ffffff; }
          body {
            color: #0f172a;
            font-family: "Plus Jakarta Sans", ui-sans-serif, system-ui, -apple-system,
              BlinkMacSystemFont, "Segoe UI", sans-serif;
            -webkit-font-smoothing: antialiased;
            text-rendering: optimizeLegibility;
          }
          .resume-isolation-container { color: #0f172a; }
          ${coverLetterStyles}
        </style>
      </head>
      <body>
        <div class="resume-isolation-container">${html}</div>
      </body>
    </html>`;
};

export async function generatePdfFromHtml(html, options = {}) {
  if (!html) throw new Error('HTML content is required.');

  const {
    documentType = 'document',
    isShowImage = true,
    margin = { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
    ...pdfOptionsOverrides
  } = options;

  const fullHtml = buildFullHtml(html, documentType);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
    protocolTimeout: 120000,
  });

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(60000);

    await page.emulateMediaType('screen');
    await page.setContent(fullHtml, {
      waitUntil: ['load', 'networkidle0'],
      timeout: 60000,
    });

    await page.addStyleTag({
      content: `
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: auto !important; overflow: visible !important; display: block !important; }
        ${!isShowImage ? '.resume-container .profile-image, .profile-image { display: none !important; }' : ''}
      `,
    });

    await page.evaluate(() => document.fonts.ready);
    await new Promise((r) => setTimeout(r, 300));

    return await page.pdf({
      format: 'A4',
      printBackground: true,
      margin,
      timeout: 60000,
      ...pdfOptionsOverrides,
    });
  } finally {
    await browser.close();
  }
}

// ─── Email Helpers ────────────────────────────────────────────────────────────

// Returns an array of MIME lines (NOT a joined string — safe to spread)
const buildAttachmentLines = (filename, mimeType, base64Data) => [
  `--boundary123`,
  `Content-Type: ${mimeType}; name="${filename}"`,
  `Content-Disposition: attachment; filename="${filename}"`,
  `Content-Transfer-Encoding: base64`,
  ``,
  base64Data,
  ``,
];

const encodeRawEmail = (parts) =>
  Buffer.from(parts.join('\r\n'))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

/**
 * Composes and sends a Gmail message with PDF attachments.
 *
 * @param {object} gmail         - Authenticated google.gmail instance
 * @param {object} params
 * @param {string} params.from
 * @param {string} params.to
 * @param {string} params.subject
 * @param {string} params.bodyHtml
 * @param {{ name: string; buffer: Buffer }[]} params.attachments
 */
export async function sendEmailWithPdfAttachments(
  gmail,
  { from, to, subject, bodyHtml, attachments },
) {
  const attachmentLines = attachments.flatMap(({ name, buffer }) =>
    buildAttachmentLines(name, 'application/pdf', buffer.toString('base64')),
  );

  const messageParts = [
    `From: <${from}>`,
    `To: <${to}>`,
    `Subject: ${subject || 'Job Application'}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="boundary123"`,
    ``,
    `--boundary123`,
    `Content-Type: text/html; charset="UTF-8"`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    bodyHtml || 'Hi, please find attached my resume and cover letter.',
    ``,
    ...attachmentLines,
    `--boundary123--`,
  ];

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodeRawEmail(messageParts) },
  });
}
