export const CV_TEMPLATES = {
  classic: `
<style>
.container {
  max-width: 800px;
  margin: 0 auto;
  font-family: "Times New Roman", serif;
  font-size: 11pt;
  line-height: 1.2;
  color: #000;
}

.header { text-align: center; margin-bottom: 14px; }
.name { font-size: 22pt; font-weight: bold; margin-bottom: 6px; }
.contact-info { font-size: 11pt; }

.section { margin-bottom: 14px; }
.section-title {
  font-size: 12pt;
  font-weight: bold;
  text-transform: uppercase;
}
.section-divider { border-bottom: 1px solid #000; margin-bottom: 6px; }

ul { list-style: disc; padding-left: 18px; margin: 0; }
li { margin-bottom: 3px; text-align: justify; }

.company, .university { font-weight: bold; }
.role, .dates { font-style: italic; }
</style>
`,

  modern: `
<style>
.container {
  max-width: 880px;
  margin: 0 auto;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 10.8pt;
  line-height: 1.35;
  color: #222;
}

.header {
  border-bottom: 2px solid #0a66c2;
  margin-bottom: 16px;
  padding-bottom: 8px;
}

.name { font-size: 20pt; font-weight: 700; }
.section-title { font-size: 11pt; font-weight: 700; color: #0a66c2; }
.section-divider { display: none; }

ul { padding-left: 16px; }
li { margin-bottom: 4px; }
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

.section-title { font-size: 11pt; font-weight: 600; color: #2f6fed; }
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
};
