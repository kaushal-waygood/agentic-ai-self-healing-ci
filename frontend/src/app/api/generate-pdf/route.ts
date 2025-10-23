// pages/api/generate-pdf.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { html, title } = req.body;

  if (!html) {
    return res.status(400).json({ message: 'HTML content is required.' });
  }

  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    // Set the HTML content of the page
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generate the PDF from the page's rendering
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm',
      },
    });

    await browser.close();

    // Set headers to trigger a download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="zobsai_${title.replace(/ /g, '_')}.pdf"`,
    );

    // Send the generated PDF buffer
    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({ message: 'Failed to generate PDF.' });
  }
}
