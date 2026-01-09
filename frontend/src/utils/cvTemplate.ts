export const CV_TEMPLATES = {
  standard: `
<style>
.container {
  max-width: 800px;
  margin: 0 auto;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11pt;
  line-height: 1.35;
  color: #000;
}

.header {
  text-align: left;
  margin-bottom: 14px;
}

.name {
  font-size: 20pt;
  font-weight: bold;
}

.contact-info {
  font-size: 10.5pt;
}

.section {
  margin-bottom: 14px;
}

.section-title {
  font-size: 11pt;
  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.section-divider {
  border-bottom: 1px solid #000;
  margin-bottom: 6px;
}

.company {
  font-weight: bold;
}

.role {
  font-style: italic;
}

ul {
  list-style: disc;
  padding-left: 18px;
  margin: 0;
}

li {
  margin-bottom: 4px;
}
</style>
`,

  classicPro: `
<style>
.container {
  max-width: 820px;
  margin: 0 auto;
  font-family: "Times New Roman", serif;
  font-size: 11.5pt;
  line-height: 1.4;
  color: #000;
}

.header {
  text-align: center;
  margin-bottom: 18px;
}

.name {
  font-size: 22pt;
  font-weight: bold;
}

.contact-info {
  font-size: 11pt;
}

.section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 12pt;
  font-weight: bold;
  letter-spacing: 0.04em;
}

.section-divider {
  border-bottom: 1px solid #000;
  margin-bottom: 8px;
}

.company,
.university {
  font-weight: bold;
}

.role,
.dates {
  font-style: italic;
}

ul {
  list-style: disc;
  padding-left: 20px;
}

li {
  margin-bottom: 4px;
}
</style>
`,

  modernPro: `
<style>
.container {
  max-width: 880px;
  margin: 0 auto;
  font-family: "Segoe UI", Arial, sans-serif;
  font-size: 11pt;
  line-height: 1.45;
  color: #000;
}

.header {
  margin-bottom: 18px;
}

.name {
  font-size: 21pt;
  font-weight: 700;
}

.contact-info {
  font-size: 10.5pt;
  color: #374151;
}

.section {
  margin-bottom: 18px;
}

.section-title {
  font-size: 11pt;
  font-weight: 700;
  color: #1f2937;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.section-divider {
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 10px;
}

.company {
  font-weight: 600;
}

.role {
  font-style: italic;
  color: #4b5563;
}

ul {
  padding-left: 18px;
}

li {
  margin-bottom: 6px;
}
</style>
`,

  minimal: `
<style>
.container {
  max-width: 760px;
  margin: 0 auto;
  font-family: Helvetica, Arial, sans-serif;
  font-size: 11pt;
  line-height: 1.4;
}

.header { text-align: center; margin-bottom: 12px; }
.name { font-size: 18pt; font-weight: 600; }

.section-title { font-size: 11pt; font-weight: 600; }
.section-divider { display: none; }

ul { list-style: "- "; padding-left: 12px; }
li { margin-bottom: 4px; }
</style>
`,

  executive: `
<style>
.container {
  max-width: 820px;
  margin: 0 auto;
  font-family: Georgia, serif;
  font-size: 11.5pt;
  line-height: 1.3;
}

.header { text-align: center; margin-bottom: 18px; }
.name { font-size: 23pt; font-weight: bold; letter-spacing: 0.5px; }

.section-title {
  font-size: 12pt;
  font-weight: bold;
  border-bottom: 2px solid #000;
}
</style>
`,

  compact: `
<style>
.container {
  max-width: 740px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
  font-size: 10pt;
  line-height: 1.25;
}

.name { font-size: 17pt; font-weight: bold; }
.section { margin-bottom: 10px; }
li { margin-bottom: 2px; }
</style>
`,

  academic: `
<style>
.container {
  max-width: 850px;
  margin: 0 auto;
  font-family: "Times New Roman", serif;
  font-size: 11pt;
  line-height: 1.4;
}

.name { font-size: 20pt; font-weight: bold; }
.section-title { font-size: 12pt; font-weight: bold; margin-top: 12px; }
.role, .dates { font-style: italic; }
</style>
`,

  tech: `
<style>
.container {
  max-width: 880px;
  margin: 0 auto;
  font-family: "Segoe UI", Arial, sans-serif;
  font-size: 10.8pt;
  line-height: 1.35;
}

.header {
  border-bottom: 1px solid #ccc;
  margin-bottom: 14px;
  padding-bottom: 8px;
}

.section-title { font-size: 11pt; font-weight: 600;; }
</style>
`,

  government: `
<style>
.container {
  max-width: 800px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
  font-size: 11pt;
  line-height: 1.3;
}

.section-title {
  font-size: 11pt;
  font-weight: bold;
  text-transform: uppercase;
}

ul { list-style: square; }
</style>
`,

  sales: `
<style>
.container {
  max-width: 820px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
  font-size: 11pt;
  line-height: 1.35;
}

.name { font-size: 21pt; font-weight: bold; }
.section-title { font-size: 12pt; font-weight: bold; }
</style>
`,

  legal: `
<style>
.container {
  max-width: 800px;
  margin: 0 auto;
  font-family: Garamond, "Times New Roman", serif;
  font-size: 11.5pt;
  line-height: 1.4;
}

.section-title {
  font-size: 12pt;
  font-weight: bold;
  text-decoration: underline;
}

.role { font-style: italic; }
</style>
`,

  student: `
<style>
.container {
  max-width: 760px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
  font-size: 11pt;
  line-height: 1.35;
}

.name { font-size: 18pt; font-weight: 600; }
.section-title { font-size: 11pt; font-weight: 600; }
li { margin-bottom: 4px; }
</style>
`,

  boldHeader: `
<style>
body { background: #f4f6f8; }

.container {
  max-width: 880px;
  margin: 30px auto;
  background: #fff;
  padding: 32px;
  font-family: Inter, Arial, sans-serif;
  font-size: 11pt;
  line-height: 1.45;
  color: #1a1a1a;
}

.header {
  background: #111827;
  color: #fff;
  padding: 24px;
  margin: -32px -32px 24px -32px;
}

.name {
  font-size: 24pt;
  font-weight: 700;
}

.contact-info {
  font-size: 10pt;
  opacity: 0.9;
}

.section-title {
  font-size: 11pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 6px;
}

.section-divider {
  border-bottom: 2px solid #111827;
  margin-bottom: 12px;
}

li { margin-bottom: 6px; }
</style>
`,

  timeline: `
<style>
.container {
  max-width: 860px;
  margin: 0 auto;
  font-family: "Segoe UI", Arial, sans-serif;
  font-size: 11pt;
  line-height: 1.4;
}

.section {
  border-left: 3px solid #2563eb;
  padding-left: 18px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 12pt;
  font-weight: 700;
  color: #2563eb;
  margin-bottom: 8px;
}

.company {
  font-weight: 700;
}

.role {
  font-style: italic;
  color: #444;
}

ul {
  margin-left: 14px;
}

li {
  margin-bottom: 6px;
}
</style>
`,

  cards: `
<style>
body { background: #eef1f5; }

.container {
  max-width: 900px;
  margin: 30px auto;
  font-family: Arial, sans-serif;
  font-size: 11pt;
}

.section {
  background: #fff;
  padding: 18px 22px;
  border-radius: 6px;
  margin-bottom: 18px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
}

.name {
  font-size: 22pt;
  font-weight: bold;
}

.section-title {
  font-size: 11pt;
  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: 10px;
}
</style>
`,

  elegantSerif: `
<style>
.container {
  max-width: 820px;
  margin: 0 auto;
  font-family: "Cormorant Garamond", Georgia, serif;
  font-size: 12pt;
  line-height: 1.5;
  color: #111;
}

.name {
  font-size: 26pt;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.section-title {
  font-size: 13pt;
  font-weight: 600;
  border-bottom: 1px solid #999;
  margin-bottom: 10px;
}

li {
  margin-bottom: 6px;
}
</style>
`,
};
