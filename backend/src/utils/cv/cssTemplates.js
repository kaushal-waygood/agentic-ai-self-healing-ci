export const CV_TEMPLATES = {
  classic: `
        .resume-container {
            font-family: "Times New Roman", Times, serif;
            line-height: 1.25;
            color: #000;
            background-color: #fff;
            font-size: 11pt; /* Standard Harvard size is 10.5pt to 11pt */
            max-width: 800px;
        }

        /* --- HEADER SECTION --- */
        .header {
            text-align: center;
            margin-bottom: 20px;
        }

        .header h1{
            font-family: 'Times New Roman', Times, serif;
              font-size: 20pt;
              font-weight: bold;
              margin-bottom: 6px;
              color: #000;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin: 0;
              height: 30px;
        }

        .contact-info {
            font-size: 10.5pt;
            color: #000;
            margin-bottom: 0;
        }

        /* --- SECTIONS --- */
        .section {
            margin-bottom: 16px;
        }

        .section-title {
            font-size: 12pt;
            font-weight: bold;
            margin-bottom: 4px;
            color: #000;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .section-divider {
            border-bottom: 1px solid #000; /* Solid black line */
            margin-bottom: 10px;
            width: 100%;
        }

        .resume-container .profile-image { display: none; }

        /* --- SUMMARY --- */
        .summary-text {
            font-size: 11pt;
            text-align: justify;
            line-height: 1.35;
            margin-bottom: 10px;
        }

        .additional {
            font-size: 11pt;
            text-align: justify;
            line-height: 1.35;
            margin-top: 6px;
            font-style: italic; /* Differentiates 'Additional' info */
            font-weight: normal;
        }

        /* --- EXPERIENCE & JOBS --- */
        .job {
            margin-bottom: 14px;
        }

        .company-line {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 2px;
        }

        .company {
            font-weight: bold;
            font-size: 11.5pt;
            text-transform: uppercase; /* Optional: makes companies stand out */
        }

        .location {
            font-size: 11pt;
            font-weight: normal; /* Locations should not compete with Company name */
            text-align: right;
        }

        .role-line {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 4px;
        }

        .role {
            font-style: italic;
            font-weight: bold; /* Harvard style often bolds the role title slightly */
            font-size: 11pt;
        }

        .dates {
            font-size: 11pt;
            font-style: normal;
            text-align: right;
        }

        /* --- BULLETS --- */
        .responsibilities {
            margin: 4px 0 0 0;
            padding: 0;
            list-style: none;
        }

        .responsibilities li {
            font-size: 11pt;
            line-height: 1.4;
            margin-bottom: 3px;
            text-align: justify;
            padding-left: 18px; /* Indent for the bullet */
            position: relative;
        }

        /* Clean, standard bullet points */
        .responsibilities li:before {
            content: "•";
            position: absolute;
            left: 0;
            font-size: 14px; /* Slightly larger bullet for visual anchor */
            line-height: 16px;
            top: 1px;
        }

        .highlight {
            font-weight: bold;
        }

        /* --- EDUCATION --- */
        .education-item {
            margin-bottom: 10px;
        }

        .degree-line {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 2px;
        }

        .university {
            font-weight: bold;
            font-size: 11.5pt;
        }

        .degree {
            font-size: 11pt;
            font-style: italic;
            display: block; /* Ensures it sits on its own line if needed, or flows */
        }

        /* --- SKILLS --- */
        .skills-section {
            font-size: 11pt;
            line-height: 1.4;
        }

        .skill-category {
            margin-bottom: 4px;
            text-align: justify;
        }

        .skill-title {
            font-weight: bold;
            display: inline;
        }

        /* Print Override to remove browser margins */
        @media print {
            body { background-color: white; }
            .resume-container { 
                margin: 0; 
                padding: 0; 
                box-shadow: none; 
                max-width: 100%;
                width: 100%;
            }
        }
`,

  tech: `  <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&family=JetBrains+Mono&display=swap');
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      .resume-container {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        line-height: 1.5;
        color: #1a1a1a;
        background-color: #fff;
        font-size: 10pt;
        max-width: 850px;
      }

      /* --- HEADER --- */
      .header {
        margin-bottom: 15px;
        border-bottom: 2px solid #000;
        padding-bottom: 10px;
      }

      .header .profile-image {
        display: none;
      }

      .name {
        height: 45px;
      }

      .name h1 {
        font-size: 28pt;
        font-weight: 800;
        letter-spacing: -1px;
        margin: 0;
        color: #000;
        text-transform: uppercase;
      }

      .contact-info {
        font-family: 'JetBrains Mono', monospace;
        font-size: 9pt;
        color: #555;
        margin-top: 5px;
        display: flex;
        gap: 15px;
      }

      /* --- SECTIONS --- */
      .section {
        margin-bottom: 20px;
      }

      .section-title {
        font-size: 11pt;
        font-weight: 800;
        color: #2563eb; /* Tech Blue */
        letter-spacing: 1px;
        text-transform: uppercase;
      }

      .section-divider {
        height: 1px;
      }

      /* --- SUMMARY --- */
      .summary-text {
        font-size: 10pt;
        color: #374151;
        text-align: justify;
      }

      .additional {
        display: flex;
        flex-direction: column;
        margin-top: 10px;
        font-size: 9pt;
        color: #6b7280;
        border-left: 2px solid #e5e7eb;
        padding-left: 10px;
        margin-top: 10px;
      }

      /* --- EXPERIENCE --- */
      .job {
        margin-bottom: 18px;
        page-break-inside: avoid;
      }

      /* Flex layout to keep Title left and Date right */
      .role-line {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 700;
        font-size: 11pt;
        color: #000;
      }

      .company-line {
        display: flex;
        justify-content: space-between;
        font-size: 9.5pt;
      }

      .company {
        color: #2563eb;
        font-weight: 600;
      }

      .location,
      .dates {
        font-family: 'JetBrains Mono', monospace;
        font-size: 8.5pt;
        color: #6b7280;
      }

      .job ul {
        margin: 0;
        padding-left: 1.2rem;
        list-style-type: square;
      }

      .job li {
        margin-bottom: 4px;
        color: #4b5563;
      }

      .section > ul > li{
        margin-bottom: 4px;
        color: #4b5563;
        list-style-type: square;
      }

      .job li strong {
        color: #111827;
      }

      /* --- PROJECTS --- */
      .section ul {
        padding-left: 1.2rem;
        margin: 0;
      }

      .section li {
        margin-bottom: 5px;
      }

      /* --- EDUCATION --- */
      .education-item ul {
        list-style: none;
        padding: 0;
      }

      .education-item li {
        font-weight: 500;
      }

      .skills-section div {
        font-size: 9pt;
        color: #374151;
      }

      .skills-section strong {
        color: #2563eb;
        text-transform: uppercase;
        font-size: 8pt;
        margin-bottom: 2px;
      }

      /* --- PRINT OPTIMIZATION --- */
      @media print {
        .resume-container {
          padding: 0;
          max-width: 100%;
        }
        .section-title {
          color: #000 !important;
        }
        .company {
          color: #2563eb !important;
          -webkit-print-color-adjust: exact;
        }
        .skills-section {
          background: #f3f4f6 !important;
          -webkit-print-color-adjust: exact;
        }
      }
    </style>`,

  sales: `<style>
      /* --- FONT IMPORT --- */
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');

      .resume-container {
        font-family: 'Plus Jakarta Sans', sans-serif;
        line-height: 1.5;
        color: #2d3748;
        background-color: #fff;
        font-size: 10.5pt;
        max-width: 850px;
      }

      /* --- HEADER --- */
      .header {
        margin-bottom: 30px;
        border-left: 6px solid #ff5a36; /* Bold Sales Accent */
        padding-left: 20px;
      }

      .header .profile-image {
        display: none;
      }

      .name h1 {
        font-size: 26pt;
        font-weight: 800;
        margin: 0;
        color: #1a202c;
        letter-spacing: -1px;
      }

      .contact-info {
        font-size: 10pt;
        color: #718096;
        margin-top: 5px;
        font-weight: 500;
      }

      /* --- SECTIONS --- */
      .section {
        margin-bottom: 25px;
      }

      .section-title {
        font-size: 11pt;
        font-weight: 800;
        color: #1a202c;
        letter-spacing: 1px;
        text-transform: uppercase;
        margin-bottom: 4px;
      }

      .section-divider {
        height: 2px;
        background-color: #ff5a36; /* Coral accent line */
        width: 40px;
        margin-bottom: 15px;
      }

      /* --- SUMMARY --- */
      .summary-text {
        font-size: 10.5pt;
        color: #4a5568;
      }

      .additional {
        display: block;
        margin-top: 10px;
        padding: 10px;
        background-color: #fff5f2;
        border-radius: 4px;
        font-size: 9pt;
        color: #c53030;
      }

      /* --- EXPERIENCE --- */
      .job {
        margin-bottom: 20px;
      }

      .company-line {
        display: flex;
        justify-content: space-between;
        font-size: 10pt;
        color: #718096;
        font-weight: 600;
      }

      .role-line {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 8px;
      }

      .role {
        font-size: 12pt;
        font-weight: 700;
        color: #ff5a36; /* High-energy color for the title */
      }

      .dates {
        font-size: 9.5pt;
        color: #1a202c;
        font-weight: 600;
      }

      .job ul {
        list-style: none;
        padding-left: 0;
      }

      .job li {
        position: relative;
        padding-left: 25px;
        margin-bottom: 6px;
      }

      /* Chart/Growth icon for Sales impact as seen in your reference */
      .job li:before {
        content: '📈';
        position: absolute;
        left: 0;
        font-size: 10pt;
      }

      /* --- PROJECTS & EDUCATION --- */
      /* Matching the list style from your reference image */
      .section ul {
        margin-top: 5px;
        padding-left: 1.2rem;
      }

      .section li {
        margin-bottom: 8px;
        color: #4a5568;
      }

      .section li strong {
        color: #1a202c;
      }

      .education-item ul {
        list-style-type: disc;
      }

      /* --- SKILLS --- */
      .skills-section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        background: #f7fafc;
        padding: 20px;
        border-radius: 6px;
        border: 1px solid #e2e8f0;
      }

      .skills-section div {
        font-size: 9.5pt;
      }

      .skills-section strong {
        display: block;
        color: #ff5a36;
        margin-bottom: 2px;
        font-size: 8.5pt;
        text-transform: uppercase;
      }

      /* --- PRINT --- */
      @media print {
        .resume-container {
          padding: 0;
          margin: 0;
        }
        .role,
        .section-divider,
        .skills-section strong {
          color: #ff5a36 !important;
          -webkit-print-color-adjust: exact;
        }
      }
    </style>`,

  modern: `<style>
      .resume-container {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }

      .header {
        display: flex;
        align-items: center;
        gap: 25px;
        margin-bottom: 5px;
        padding-bottom: 20px;
      }

      .header .profile-image img {
        width: 120px;
        height: 120px;
        border-radius: 10px;
        object-fit: cover;
        border: 2px solid #2c3e50;
      }

      .header .profile-info {
        flex: 1;
      }

      .resume-container .header .name h1 {
        font-size: 28pt;
        font-weight: 800;
        color: #2c3e50;
        margin: 0;
        text-transform: uppercase;
        letter-spacing: -1px;
      }

      .contact-info p {
        font-size: 14pt;
        line-height: 1.4;
        color: #666;
        font-weight: 600;
        margin:0;
      }

      /* --- Summary Section (Section 1) --- */
      /* Repurposed to act as a professional bio block */
      .section:nth-of-type(1) {
        background: #2c3e50;
        color: #fff;
        padding: 25px;
        border-radius: 8px;
        margin-bottom: 30px;
      }

      .section:nth-of-type(1) .section-title {
        font-size: 14pt;
        font-weight: 700;
        margin-bottom: 10px;
        color: #6cc5d6;
      }

      .summary-text {
        line-height: 1.4;
        font-size: 14pt;
        text-align: justify;
      }

      .section:nth-of-type(1) .summary-text {
        line-height: 1.4;
        font-size: 14pt;
        text-align: justify;
      }

      .section:nth-of-type(1) .additional {
        display: block;
        margin-top: 15px;
        font-size: 9pt;
        opacity: 0.9;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        padding-top: 10px;
      }

      /* --- General Section Layout --- */
      .section:not(:nth-of-type(1)) {
        margin-bottom: 15px;
      }

      .section:not(:nth-of-type(1)) .section-title {
        font-size: 14pt;
        font-weight: 700;
        color: #2c3e50;
        text-transform: uppercase;
        display: block;
        border-bottom: 2px solid #6cc5d6;
        padding-bottom: 5px;
        margin-bottom: 8px;
      }

      /* --- Experience & Job Styling --- */
      .job {
        margin-bottom: 20px;
      }

      .company-line {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .company {
        font-size: 13pt;
        font-weight: 700;
        color: #000;
      }

      .location {
        font-size: 9.5pt;
        color: #666;
      }

      .role-line {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .role {
        font-size: 11pt;
        font-weight: 700;
        color: #6cc5d6;
      }

      .dates {
        font-size: 9.5pt;
        color: #666;
        font-style: italic;
      }

      /* --- Lists (ATS Friendly) --- */
      ul {
        padding-left: 18px;
        margin: 5px 0;
      }

      li {
        font-size: 14pt;
        color: #444;
        margin-bottom: 3px;
        line-height: 1.4;
      }

      /* --- Skills Section --- */
      .skills-section {
        display: grid;
        grid-template-columns: 1fr;
      }

      .skills-section div {
        font-size: 14pt;
        border-bottom: 1px border #eee;
        line-height: 1.4;
      }

      .skills-section strong {
        color: #2c3e50;
      }

      /* --- Education Styling --- */
      .education-item ul li {
        list-style: none;
        padding-left: 0;
        font-weight: 600;
        color: #333;
      }

      /* Hide Dividers as we use borders now */
      .section-divider {
        display: none;
      }

      /* Removal of the old absolute positioning that broke the flow */
      .section:nth-of-type(1) .profile-image {
        display: none;
      }
    </style>`,

  executive: `
<style>
.resume-container {
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
.resume-container {
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
.resume-container {
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

  government: `
<style>
.resume-container {
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

  legal: `
<style>
.resume-container {
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
.resume-container {
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

export const DEFAULT_TEMPLATE = 'classic';
