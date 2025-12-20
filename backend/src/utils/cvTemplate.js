// src/utils/cvTemplate.js

export const CV_CSS = `
<style>
/* ===== PAGE ===== */
.container {
    max-width: 800px;
    margin: 0 auto;
    font-family: "Times New Roman", serif;
    font-size: 11pt;
    line-height: 1.2;
    color: #000;
    background-color: #fff;
}

/* ===== HEADER ===== */
.header {
    text-align: center;
    margin-bottom: 14px;
}

.name {
    font-size: 22pt;
    font-weight: bold;
    margin-bottom: 6px;
}

.contact-info {
    font-size: 11pt;
}

/* ===== SECTIONS ===== */
.section {
    margin-bottom: 14px;
}

.section-title {
    font-size: 12pt;
    font-weight: bold;
    text-transform: uppercase;
    margin-bottom: 2px;
}

.section-divider {
    border-bottom: 1px solid #000;
    margin-bottom: 6px;
}

/* ===== SUMMARY ===== */
.summary-text {
    text-align: justify;
    line-height: 1.3;
}

.additional {
    font-weight: bold;
}

/* ===== EXPERIENCE ===== */
.job {
    margin-bottom: 10px;
}

.company-line,
.role-line,
.degree-line {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
}

.company,
.location,
.university {
    font-weight: bold;
}

.role,
.dates,
.degree {
    font-style: italic;
}

/* ===== BULLETS (NATIVE ONLY) ===== */
ul {
    list-style: disc;
    padding-left: 18px;
    margin: 0;
}

li {
    margin-bottom: 3px;
    text-align: justify;
}

/* ===== SKILLS ===== */
.skills-section {
    line-height: 1.35;
}

/* ===== FORCE 2-PAGE MAX ===== */
@media print {
    body {
        margin: 0;
    }

    .container {
        max-height: 277mm; /* ~2 A4 pages minus margins */
        overflow: hidden;
    }

    .job,
    li {
        page-break-inside: avoid;
    }
}
</style>
`;

export function wrapCVHtml(bodyHtml, title = 'Resume') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${title}</title>
${CV_CSS}
</head>
<body>
${bodyHtml}
</body>
</html>`;
}
