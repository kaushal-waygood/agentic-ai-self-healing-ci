/**
 * CV HTML wrapper - re-exports from cvTemplate for consistency.
 * Use wrapCVHtml from utils/cvTemplate.js as the single source of truth.
 */
import { wrapCVHtml as wrapCVHtmlImpl } from '../cvTemplate.js';
import { DEFAULT_TEMPLATE } from './cssTemplates.js';

/**
 * Wraps CV body HTML with full document, title, and template styles.
 * @param {string} innerHtml - CV body HTML
 * @param {string} title - Document title
 * @param {string} [templateKey] - Template key (classic, tech, sales, modern). Default: classic
 */
export const wrapCVHtml = (innerHtml, title, templateKey = DEFAULT_TEMPLATE) =>
  wrapCVHtmlImpl(innerHtml, { title, template: templateKey });
