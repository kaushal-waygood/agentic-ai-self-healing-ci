import puppeteer from 'puppeteer';

export async function generatePdfFromHtml(html, options = {}) {
  if (!html) throw new Error('HTML content is required.');

  const {
    documentType = 'document',
    isShowImage = true,
    margin = { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
    ...pdfOptionsOverrides
  } = options;

  const normalizedType = String(documentType || 'document').toLowerCase();
  const fullHtml = html.includes('<html')
    ? html
    : `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Document</title>
          <style>
            html, body {
              margin: 0;
              padding: 0;
              background: #ffffff;
            }
            body {
              color: #0f172a;
              font-family: "Plus Jakarta Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
              -webkit-font-smoothing: antialiased;
              text-rendering: optimizeLegibility;
            }
            .resume-isolation-container {
              color: #0f172a;
            }
            ${
              normalizedType === 'coverletter'
                ? `
            .resume-isolation-container {
              font-size: 16px;
              line-height: 1.55;
            }
            .resume-isolation-container p {
              margin: 0 0 1.25rem;
            }
            .resume-isolation-container p:last-child {
              margin-bottom: 0;
            }
            `
                : ''
            }
          </style>
        </head>
        <body>
          <div class="resume-isolation-container">${html}</div>
        </body>
      </html>`;

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
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        html, body {
          height: auto !important;
          overflow: visible !important;
          display: block !important;
        }
        ${
          isShowImage
            ? ''
            : '.resume-container .profile-image, .profile-image { display: none !important; }'
        }
      `,
    });

    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    await new Promise((resolve) => setTimeout(resolve, 300));

    const pdfOptions = {
      format: 'A4',
      printBackground: true,
      margin,
      timeout: 60000,
      ...pdfOptionsOverrides,
    };

    return await page.pdf(pdfOptions);
  } finally {
    await browser.close();
  }
}

export const createAttachment = (filename, mimeType, base64Data) => {
  return [
    `--boundary123`,
    `Content-Type: ${mimeType}; name="${filename}"`,
    `Content-Disposition: attachment; filename="${filename}"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    base64Data,
    ``,
  ].join('\r\n');
};
