// ESM style (since your project uses `import`)
// Minimal dynamic template manager with caching, partials, layout support and text fallback.
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class TemplateManager {
  constructor(opts = {}) {
    this.baseDir = opts.baseDir || path.join(__dirname, '..', 'templates');
    this.layoutFile = opts.layoutFile || 'layout.html'; // layout contains {{{body}}}
    this.cache = new Map();
  }

  async init() {
    // pre-warm cache for layout & partials
    await this._loadLayout();
    await this._loadPartials();
  }

  async _loadLayout() {
    const layoutPath = path.join(this.baseDir, this.layoutFile);
    const content = await fs.readFile(layoutPath, 'utf8');
    this.cache.set('@@layout', content);
    return content;
  }

  async _loadPartials() {
    const partialsDir = path.join(this.baseDir, 'partials');
    let list = [];
    try {
      list = await fs.readdir(partialsDir);
    } catch (e) {
      // no partials dir is OK
      return;
    }
    for (const filename of list) {
      if (!filename.endsWith('.html')) continue;
      const name = path.basename(filename, '.html');
      const content = await fs.readFile(
        path.join(partialsDir, filename),
        'utf8',
      );
      this.cache.set(`partial:${name}`, content);
    }
  }

  async _loadTemplate(templateName) {
    const key = `tpl:${templateName}`;
    if (this.cache.has(key)) return this.cache.get(key);
    const p = path.join(this.baseDir, `${templateName}.html`);
    const content = await fs.readFile(p, 'utf8');
    this.cache.set(key, content);
    return content;
  }

  // naive replacer: {{key}}, {{{body}}}, partials {{> partialName}}
  renderString(templateStr, data = {}) {
    // replace partials first
    const partialRegex = /{{>\s*([\w\-\/]+)\s*}}/g;
    templateStr = templateStr.replace(partialRegex, (m, name) => {
      const p = this.cache.get(`partial:${name}`);
      return p ?? '';
    });

    // body (unescaped)
    templateStr = templateStr.replace(/{{{\s*body\s*}}}/g, data.__body ?? '');

    // simple placeholders
    return templateStr.replace(/{{\s*([^{}\s]+)\s*}}/g, (m, key) => {
      const v = data[key];
      if (v === undefined || v === null) return '';
      return String(v);
    });
  }

  async compile(templateName, data = {}) {
    // load layout / partials lazily
    if (!this.cache.has('@@layout')) await this._loadLayout();
    await this._loadPartials();

    const bodyFragment = await this._loadTemplate(templateName);
    // allow placeholders in body
    const bodyRendered = this.renderString(bodyFragment, data);
    const layout = this.cache.get('@@layout');
    // inject body into layout and render layout placeholders
    const html = this.renderString(
      layout,
      Object.assign({}, data, { __body: bodyRendered }),
    );
    return html;
  }

  // helper to produce a plain-text fallback from a template (very basic)
  stripTags(html) {
    return html
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/<\/?[^>]+(>|$)/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  async compileWithTextFallback(templateName, data = {}) {
    const html = await this.compile(templateName, data);
    const text = this.stripTags(html);
    return { html, text };
  }
}

export default TemplateManager;
