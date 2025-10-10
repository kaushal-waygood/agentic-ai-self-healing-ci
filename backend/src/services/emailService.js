import { genAI } from '../config/gemini.js';
import puppeteer from 'puppeteer';
import { User } from '../models/User.model.js';
import { google } from 'googleapis';

export const sendJobApplicationEmail = async ({
  jobData,
  student,
  senderEmail,
  recipientEmail,
}) => {
  try {
    if (!jobData?.job) throw new Error('Invalid job data');
    if (!senderEmail) {
      throw new Error(
        'sendJobApplicationEmail was called without a senderEmail.',
      );
    }

    const user = await User.findOne({ email: senderEmail }).select('tokens');
    if (!user || !user.tokens) {
      throw new Error(`Could not find user or OAuth tokens for ${senderEmail}`);
    }
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials(user.tokens);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const rawAiResponse = await genAI(
      generateApplicationContentPrompt(jobData, student),
    );

    const jsonMatch = rawAiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : rawAiResponse; // Use the extracted part, or the raw response as a fallback

    let content;
    try {
      content = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse JSON from AI response:', jsonString);
      throw new Error('Invalid JSON received from AI.');
    }

    const { subject, emailHtml, cvHtml, clHtml } = content;

    if (!subject || !emailHtml || !cvHtml || !clHtml) {
      throw new Error('AI failed to generate all required content parts.');
    }

    console.log('Generating PDFs from HTML...');
    const [cvPdfBuffer, clPdfBuffer] = await Promise.all([
      createPdfFromHtml(cvHtml),
      createPdfFromHtml(clHtml),
    ]);
    const cvBase64 = cvPdfBuffer.toString('base64');
    const clBase64 = clPdfBuffer.toString('base64');
    console.log('PDFs generated and encoded successfully.');

    const boundary = 'boundary_string_for_job_application';
    const rawMessage = [
      `From: "${student.fullName}" <${senderEmail}>`,
      `To: ${recipientEmail}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      ``,
      `--${boundary}`,
      `Content-Type: text/html; charset="UTF-8"`,
      `Content-Transfer-Encoding: 7bit`,
      ``,
      emailHtml,
      ``,
      `--${boundary}`,
      `Content-Type: application/pdf; name="CV_${student.fullName.replace(
        /\s+/g,
        '_',
      )}.pdf"`,
      `Content-Disposition: attachment; filename="CV_${student.fullName.replace(
        /\s+/g,
        '_',
      )}.pdf"`,
      `Content-Transfer-Encoding: base64`,
      ``,
      cvBase64,
      ``,
      `--${boundary}`,
      `Content-Type: application/pdf; name="CoverLetter_${student.fullName.replace(
        /\s+/g,
        '_',
      )}.pdf"`,
      `Content-Disposition: attachment; filename="CoverLetter_${student.fullName.replace(
        /\s+/g,
        '_',
      )}.pdf"`,
      `Content-Transfer-Encoding: base64`,
      ``,
      clBase64,
      ``,
      `--${boundary}--`,
    ].join('\n');

    const encodedMessage = Buffer.from(rawMessage).toString('base64url');

    console.log('Sending email via Gmail API...');
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage },
    });

    console.log('Email sent successfully:', response.data);
    return { success: true, messageId: response.data.id };
  } catch (error) {
    console.error('Failed to send application email:', {
      error: error.message,
      jobTitle: jobData?.job?.title,
      student: student,
    });
    throw error;
  }
};

export const generateApplicationContentPrompt = (data, student) => {
  return `
  Generate a plain professional application email in HTML format without any borders, lines, or decorative elements.
  Use only simple HTML tags with minimal inline styling (font-family and spacing only).
  
  Position: ${data.title}
  Company: ${data.company}
  
  Candidate: ${student}
  
  Requirements:
  - No borders, lines, or decorative elements
  - Simple font styling only (no colors except black)
  - No tables or complex layouts
  - Basic HTML structure only
  - No markdown or code blocks
  `;
};

export const generateCVPrompts = (data, student) => {
  return `
  Generate a clean Harvard-style CV in plain HTML format with these strict requirements:
  
  - Absolutely NO borders, lines, or decorative elements
  - No tables or complex layouts
  - Minimal styling (font-family and spacing only)
  - Black text only
  - Simple section headings
  - No background colors or images
  - No markdown or code blocks
  
  Job: ${data.job.title} at ${data.job.company}
  
  Candidate Details:
  ${JSON.stringify(student, null, 2)}
  
  Required Sections:
  1. Contact Info (single line)
  2. Professional Summary (3-4 lines)
  3. Skills (bullet points)
  4. Experience (company, title, dates, bullet points)
  5. Education (degree, institution, dates)
  
  Return only the HTML content ready for PDF conversion.
  `;
};

export const generateCLPrompts = (data, student) => {
  return `
  Generate a plain professional cover letter in HTML format with these requirements:
  
  - NO borders, lines, or decorative elements
  - No tables
  - Minimal styling (font-family and spacing only)
  - Black text only
  - Simple paragraph structure
  - No markdown or code blocks
  
  Job: ${data.job.title} at ${data.job.company}
  
  Candidate: ${student.fullName}
  
  Structure:
  1. Date and address (single line each)
  2. Salutation
  3. Opening paragraph (interest in position)
  4. Middle paragraph (qualifications)
  5. Closing paragraph (call to action)
  6. Signature
  
  Return only the HTML content ready for PDF conversion.
  `;
};

export const createPdfFromHtml = async (html) => {
  console.log('Starting PDF generation...');
  console.log('HTML content length:', html.length);

  // Validate HTML input
  if (!html || typeof html !== 'string') {
    throw new Error('Invalid HTML content for PDF generation');
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
      ],
    });

    const page = await browser.newPage();

    // Set longer timeout for complex HTML
    await page.setDefaultNavigationTimeout(60000);

    // Configure PDF options
    const pdfOptions = {
      format: 'A4',
      printBackground: true,
      margin: {
        top: '5mm',
        right: '10mm',
        bottom: '5mm',
        left: '10mm',
      },
      timeout: 60000,
    };

    console.log('Setting HTML content...');
    await page.setContent(html, {
      waitUntil: ['domcontentloaded', 'networkidle0'],
      timeout: 60000,
    });

    console.log('Generating PDF...');
    const pdfBuffer = await page.pdf(pdfOptions);

    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('Empty PDF buffer generated');
    }

    console.log('PDF generated successfully, size:', pdfBuffer.length, 'bytes');
    return pdfBuffer;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  } finally {
    if (browser) {
      console.log('Closing browser instance...');
      await browser
        .close()
        .catch((e) => console.error('Error closing browser:', e));
    }
  }
};
