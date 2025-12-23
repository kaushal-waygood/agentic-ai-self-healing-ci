import puppeteer from 'puppeteer';

export async function generatePdfFromHtml(html, options = {}) {
  if (!html) throw new Error('HTML content is required.');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox'],
  });

  try {
    const page = await browser.newPage();
    const fullHtml = html.includes('<html')
      ? html
      : `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Document</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
          </style>
        </head>
        <body>${html}</body>
      </html>`;

    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

    const pdfOptions = {
      format: 'A4',
      printBackground: true,
      margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
      ...options,
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
