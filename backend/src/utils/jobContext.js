// src/utils/jobContext.js
export const buildJobContextString = (job) => {
  if (!job) return '';

  const lines = [];
  const safe = (v) => (v == null ? '' : String(v).trim());
  const arr = (a) => (Array.isArray(a) ? a.filter(Boolean).map(String) : []);

  lines.push(`# Job`);
  lines.push(`Title: ${safe(job.title)}`);
  if (job.company) lines.push(`Company: ${safe(job.company)}`);

  const city = safe(job.location?.city);
  const country = safe(job.country);
  if (city || country)
    lines.push(`Location: ${[city, country].filter(Boolean).join(', ')}`);

  if (Array.isArray(job.jobTypes) && job.jobTypes.length) {
    lines.push(`Employment: ${job.jobTypes.join(', ')}`);
  }

  if (job.isRemote) lines.push(`Remote: Yes`);

  if (job.salary?.min != null || job.salary?.max != null) {
    const min = job.salary?.min != null ? job.salary.min : '';
    const max = job.salary?.max != null ? job.salary.max : '';
    const per = job.salary?.period || 'YEAR';
    lines.push(`Salary: ${min}${max ? ' - ' + max : ''} per ${per}`);
  }

  if (job.applyMethod?.method) {
    const am = job.applyMethod;
    const via =
      am.method === 'EMAIL'
        ? `EMAIL (${am.email || ''})`
        : `URL (${am.url || ''})`;
    lines.push(`Apply: ${via}`);
  }

  if (job.description) {
    lines.push('');
    lines.push(`# Description`);
    lines.push(job.description);
  }

  const quals = arr(job.qualifications);
  if (quals.length) {
    lines.push('');
    lines.push(`# Qualifications`);
    for (const q of quals) lines.push(`- ${q}`);
  }

  const resps = arr(job.responsibilities);
  if (resps.length) {
    lines.push('');
    lines.push(`# Responsibilities`);
    for (const r of resps) lines.push(`- ${r}`);
  }

  const tags = arr(job.tags);
  if (tags.length) {
    lines.push('');
    lines.push(`# Tags`);
    for (const t of tags) lines.push(`- ${t}`);
  }

  return lines.join('\n');
};
