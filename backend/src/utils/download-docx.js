import puppeteer from 'puppeteer';
import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

function cleanupFiles(...paths) {
  for (const p of paths) {
    try {
      if (p) fs.unlinkSync(p);
    } catch (_) {}
  }
}

function ensurePythonDeps() {
  const deps = ['pdf2docx', 'docx'];
  for (const dep of deps) {
    const importName = dep === 'docx' ? 'docx' : dep;
    try {
      execSync(`python3 -c "import ${importName}"`, { stdio: 'ignore' });
    } catch {
      console.log(`[generateDocx] Installing ${dep}...`);
      try {
        execSync(`pip3 install ${dep} --break-system-packages --quiet`, {
          stdio: 'inherit',
          timeout: 120000,
        });
      } catch {
        execSync(`pip3 install ${dep} --quiet`, {
          stdio: 'inherit',
          timeout: 120000,
        });
      }
    }
  }
}

function runPythonScript(script) {
  return new Promise((resolve, reject) => {
    const proc = spawn('python3', ['-c', script]);
    const out = [];
    const err = [];
    proc.stdout.on('data', (d) => out.push(d));
    proc.stderr.on('data', (d) => err.push(d));
    proc.on('close', (code) => {
      if (code !== 0) reject(new Error(Buffer.concat(err).toString()));
      else resolve(Buffer.concat(out).toString().trim());
    });
    proc.on('error', reject);
  });
}

// ── Convert PDF → DOCX ────────────────────────────────────────────────────────
function pdfToDocx(pdfPath, docxPath) {
  return runPythonScript(`
from pdf2docx import Converter
cv = Converter(r"${pdfPath}")
cv.convert(r"${docxPath}", start=0, end=None)
cv.close()
`);
}

// ── Post-process: flatten single-column tables → paragraphs ──────────────────
// pdf2docx sometimes wraps bullet-point rows or simple text in 1-column tables.
// This script detects tables that are layout artifacts (no real borders, or
// single column) and replaces them with plain paragraphs.
function flattenSpuriousTables(docxPath, outPath) {
  return runPythonScript(`
from docx import Document
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import copy

doc = Document(r"${docxPath}")

def is_spurious_table(table):
    """
    A table is spurious (pdf2docx layout artifact) if:
    - It has only 1 column, OR
    - All cells have no visible border AND the table has <= 2 columns
      with one cell appearing to be just a bullet/whitespace
    """
    col_count = len(table.columns)
    if col_count == 1:
        return True
    if col_count == 2:
        # Check if first cell is just a bullet or whitespace
        first_text = table.cell(0, 0).text.strip()
        if first_text in ('', '•', '-', '*', '·'):
            return True
    return False

def table_to_paragraphs(table, parent):
    """Extract all text runs from table cells as paragraphs."""
    new_paras = []
    for row in table.rows:
        for i, cell in enumerate(row.cells):
            cell_text = cell.text.strip()
            # Skip empty cells and pure-bullet cells
            if not cell_text or cell_text in ('•', '-', '*', '·'):
                continue
            for para in cell.paragraphs:
                if para.text.strip():
                    new_paras.append(para._element)
    return new_paras

body = doc.element.body
elements = list(body)

for elem in elements:
    if elem.tag == qn('w:tbl'):
        # Wrap in docx Table object to inspect
        from docx.table import Table
        table = Table(elem, doc)
        if is_spurious_table(table):
            # Extract paragraphs from the table
            new_paras = table_to_paragraphs(table, body)
            # Insert them before the table
            for para_elem in new_paras:
                body.insert(list(body).index(elem), copy.deepcopy(para_elem))
            # Remove the original table
            body.remove(elem)

doc.save(r"${outPath}")
print("done")
`);
}

// Run once at startup
ensurePythonDeps();

export const generateDocx = async (req, res) => {
  const { html, title = 'Document', isShowImage } = req.body;

  if (!html) {
    return res.status(400).json({ message: 'HTML content is required.' });
  }

  const safeTitle = title.replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 100);
  const tmpId = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const pdfPath = path.join(os.tmpdir(), `cp_${tmpId}.pdf`);
  const docxRaw = path.join(os.tmpdir(), `cp_${tmpId}_raw.docx`);
  const docxFinal = path.join(os.tmpdir(), `cp_${tmpId}.docx`);

  let browser;

  try {
    // ── Step 1: Render PDF (identical to your working PDF route) ─────────────
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
      protocolTimeout: 120000,
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(60000);
    await page.emulateMediaType('screen');

    await page.setContent(html, {
      waitUntil: ['load', 'networkidle0'],
      timeout: 60000,
    });

    await page.addStyleTag({
      content: `
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: auto !important; overflow: visible !important; display: block !important; }
        ${isShowImage ? '' : '.resume-container .profile-image { display: none; }'}
      `,
    });

    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    await new Promise((r) => setTimeout(r, 300));

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', right: '15mm', bottom: '15mm', left: '15mm' },
      timeout: 60000,
    });

    await browser.close();
    browser = null;
    fs.writeFileSync(pdfPath, pdfBuffer);

    // ── Step 2: PDF → raw DOCX ────────────────────────────────────────────────
    await pdfToDocx(pdfPath, docxRaw);

    // ── Step 3: Flatten spurious tables → clean DOCX ─────────────────────────
    await flattenSpuriousTables(docxRaw, docxFinal);

    if (!fs.existsSync(docxFinal)) {
      throw new Error('Post-processing did not produce output file');
    }

    // ── Step 4: Send to client ────────────────────────────────────────────────
    const docxBuffer = fs.readFileSync(docxFinal);
    const downloadName = `CareerPilot_${safeTitle}.docx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${downloadName}"`,
    );
    res.setHeader('Content-Length', docxBuffer.length);
    res.send(docxBuffer);
  } catch (error) {
    console.error('DOCX Generation Error:', error);
    if (browser) await browser.close();
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: 'Failed to generate DOCX.', error: error.message });
    }
  } finally {
    cleanupFiles(pdfPath, docxRaw, docxFinal);
  }
};
