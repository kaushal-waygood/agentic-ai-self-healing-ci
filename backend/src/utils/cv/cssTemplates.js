export const CV_TEMPLATES = {
  classic: `
        .container {
            font-family: "Times New Roman", Times, serif;
            line-height: 1.25;
            color: #000;
            background-color: #fff;
            font-size: 11pt; /* Standard Harvard size is 10.5pt to 11pt */
            max-width: 800px;
            margin: 40px auto;
        }

        /* --- HEADER SECTION --- */
        .header {
            text-align: center;
            margin-bottom: 20px;
        }

        .name {
            font-size: 20pt; /* Reduced slightly from 22pt for a more professional look */
            font-weight: bold;
            margin-bottom: 6px;
            color: #000;
            text-transform: uppercase; /* Common in Ivy League templates */
            letter-spacing: 0.5px;
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
            .container { 
                margin: 0; 
                padding: 0; 
                box-shadow: none; 
                max-width: 100%;
                width: 100%;
            }
        }
`,

  sales: `
<style>
.container {
            font-family: 'Roboto', Helvetica, Arial, sans-serif;
            line-height: 1.4;
            color: #333;
            background-color: #fff;
            font-size: 10.5pt;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 50px;
        }

        /* --- HEADER SECTION --- */
        .header {
            text-align: left; /* Screenshot is left-aligned */
            margin-bottom: 30px;
            border-bottom: none; /* Removed default border */
        }

        .name {
            font-size: 32pt;
            text-align: left;
            font-weight: 900; /* Extra bold like screenshot */
            text-transform: uppercase;
            color: #222;
            margin-bottom: 4px;
            letter-spacing: 0.5px;
            line-height: 1;
        }

        /* Simulating the "Sales Representative" subtitle from screenshot using pseudo-element 
           (Optional: strictly strictly styling the existing contact info) */
        .contact-info {
            font-size: 10pt;
            color: #666;
            margin-top: 10px;
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            font-weight: 500;
        }

        /* --- SECTIONS --- */
        .section {
            margin-bottom: 24px;
        }

        .section-title {
            font-size: 14pt;
            font-weight: 800;
            text-transform: uppercase;
            color: #000;
            margin-bottom: 12px;
            padding-bottom: 4px;
            letter-spacing: 0.5px;
        }

        .section-divider {
            display: none; /* Hiding the thin divider in favor of the thick border above */
        }

        /* --- SUMMARY --- */
        .summary-text {
            font-size: 10.5pt;
            text-align: left;
            line-height: 1.5;
            color: #444;
        }

        .additional {
            margin-top: 8px;
            font-size: 10pt;
            color: #666;
            font-style: italic;
        }

        /* --- EXPERIENCE / JOBS (The "Magic" Layout) --- */
        
        /* The screenshot shows: Role Name (Top) -> Company Name (Color) (Below).
           Your HTML has: Company (Top) -> Role (Below).
           We use Flexbox to visually swap them without changing HTML.
        */
        .job {
            display: flex;
            flex-direction: column;
            margin-bottom: 20px;
            border-bottom: 3px solid #FA7C6D;
        }


        /* Order 1: Role Line (Visual Top) */
        .role-line {
            order: 1;
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 2px;
        }

        .role {
            font-size: 12pt;
            font-weight: 700;
            color: #000; /* Black Role Title */
        }

        .dates {
            font-size: 10pt;
            color: #666;
            font-weight: 500;
        }

        /* Order 2: Company Line (Visual Middle) */
        .company-line {
            order: 2;
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 8px; /* Space before bullets */
        }

        .company {
            font-size: 11pt;
            font-weight: 500;
            color: #FA7C6D; /* THE SALES CORAL COLOR */
            text-transform: uppercase; /* Makes it look like a distinct label */
        }

        .location {
            font-size: 10pt;
            color: #888;
            font-weight: 400;
        }

        /* Adding icons via CSS to mimic screenshot */
        .location:before {
            content: "📍 ";
            font-size: 0.9em;
        }
        .dates:before {
            content: "🗓 ";
            font-size: 0.9em;
        }

        /* Order 3: Bullets (Visual Bottom) */
        .responsibilities {
            order: 3;
            margin: 0;
            padding-left: 18px;
            list-style: none; /* Custom bullets */
        }

        .responsibilities li {
            margin-bottom: 4px;
            font-size: 10.5pt;
            color: #444;
            line-height: 1.4;
            position: relative;
        }

        .responsibilities li:before {
            content: "•";
            color: #000;
            font-weight: bold;
            position: absolute;
            left: -15px;
        }

        .highlight {
            font-weight: 700;
            color: #000;
        }

        /* --- EDUCATION --- */
        /* Applying similar logic to Education if needed, or keeping standard */
        .education-item {
            margin-bottom: 12px;
        }

        .degree-line {
            display: flex;
            justify-content: space-between;
        }

        .university {
            color: #FA7C6D; /* Coral color for University name (like Company) */
            font-weight: 700;
            font-size: 11pt;
        }

        .degree {
            font-weight: 700;
            color: #000;
        }

        /* --- SKILLS --- */
        .skills-section {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        
        .skill-category {
            font-size: 10.5pt;
        }

        .skill-title {
            font-weight: 700;
            color: #000;
            text-decoration: none;
            border-bottom: 2px solid #FA7C6D; /* Coral underline for skill headers */
            padding-bottom: 1px;
            margin-right: 5px;
        }


        .job { display: flex; flex-direction: column;, border-bottom: 3px solid #FA7C6D; }
        .company-line { order: 2; } /* Visually moves down */
        .role-line { order: 1; }    /* Visually moves up */

        /* Print adjustments */
        @media print {
            .container { padding: 0; margin: 0; width: 100%; max-width: 100%; }
            .section-title { border-bottom: 3px solid #000 !important; }
            .company, .university { color: #FA7C6D !important; -webkit-print-color-adjust: exact; }
        }
</style>
`,

  tech: `
<style>
.container {
            font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.4;
            color: #333;
            background-color: #fff;
            font-size: 10.5pt; /* Tech resumes are often slightly smaller font to fit more data */
            max-width: 850px;
            margin: 40px auto;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            border-top: 5px solid #2f6fed; /* Tech Accent Top Border */
        }

        /* --- HEADER SECTION --- */
        .header {
            text-align: center;
            margin-bottom: 24px;
        }

        .name {
            font-size: 24pt;
            font-weight: 700;
            margin-bottom: 6px;
            color: #111;
            letter-spacing: -0.5px; /* Modern tight tracking */
        }

        .contact-info {
            font-size: 10pt;
            color: #555;
            margin-bottom: 0;
        }

        /* --- SECTIONS --- */
        .section {
            margin-bottom: 20px;
        }

        .section-title {
            font-size: 11pt;
            font-weight: 700;
            margin-bottom: 4px;
            color: #2f6fed; /* Tech Blue Accent */
            text-transform: uppercase;
            letter-spacing: 0.8px;
        }

        .section-divider {
            border-bottom: 1px solid #e0e0e0; /* Subtle light grey divider */
            margin-bottom: 12px;
        }

        /* --- SUMMARY --- */
        .summary-text {
            font-size: 10.5pt;
            text-align: left; /* Tech resumes prefer left-align over justify */
            line-height: 1.5;
            color: #444;
            margin-bottom: 8px;
        }

        .additional {
            font-size: 10pt;
            color: #666;
            background-color: #f8f9fa; /* Subtle highlight box for meta-data */
            padding: 8px 12px;
            border-radius: 4px;
            border-left: 3px solid #2f6fed;
            text-align: left;
            margin-top: 8px;
            font-weight: normal;
        }

        /* --- EXPERIENCE & JOBS --- */
        .job {
            margin-bottom: 18px;
        }

        .company-line {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 2px;
        }

        .company {
            font-weight: 700;
            font-size: 11.5pt;
            color: #000;
        }

        .location {
            font-size: 10pt;
            color: #777;
            font-weight: normal;
        }

        .role-line {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 6px;
        }

        .role {
            font-style: normal; /* Tech style prefers normal over italic usually */
            font-weight: 600;
            font-size: 11pt;
            color: #2f6fed; /* Accent color for role to make it pop */
        }

        .dates {
            font-size: 10pt;
            color: #555;
            font-family: "Segoe UI", Roboto, monospace; /* Monospace numbers look techy */
        }

        /* --- BULLETS --- */
        .responsibilities {
            margin: 6px 0 0 0;
            padding: 0;
            list-style: none;
        }

        .responsibilities li {
            font-size: 10.5pt;
            line-height: 1.45;
            margin-bottom: 4px;
            text-align: left;
            padding-left: 16px;
            position: relative;
            color: #333;
        }

        .responsibilities li:before {
            content: "›"; /* Chevron bullet feels more modern/tech */
            position: absolute;
            left: 0;
            font-weight: bold;
            color: #2f6fed; /* Accent colored bullet */
            font-size: 14px;
            line-height: 18px;
            top: -1px;
        }

        .highlight {
            font-weight: 600;
            color: #000;
        }

        /* --- EDUCATION --- */
        .education-item {
            margin-bottom: 12px;
        }

        .degree-line {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
        }

        .university {
            font-weight: 700;
            font-size: 11pt;
            color: #222;
        }

        .degree {
            font-size: 10.5pt;
            color: #444;
            margin-top: 2px;
        }

        /* --- SKILLS --- */
        .skills-section {
            font-size: 10.5pt;
            line-height: 1.6;
        }

        .skill-category {
            margin-bottom: 8px;
            text-align: left;
        }

        .skill-title {
            font-weight: 700;
            color: #2f6fed;
            display: inline;
            margin-right: 4px;
        }

        /* Print Media Query */
        @media print {
            body { background-color: white; }
            .container { 
                margin: 0; 
                padding: 0; 
                box-shadow: none; 
                width: 100%; 
                max-width: 100%;
                border-top: none; 
            }
            .section-title { color: #000 !important; } /* Fallback for B&W printers */
            .role { color: #333 !important; }
            .responsibilities li:before { color: #333 !important; }
            .additional { border-left-color: #333 !important; background-color: #eee !important; }
        }
</style>
`,

  modern: `<style>
.container {
    max-width: 850px;
    margin: 40px auto;
    background-color: #fff;
    color: #333;
    position: relative; /* CRITICAL: Anchors the absolute profile image */
    overflow: hidden;   /* Keeps the layout contained */
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

/* Fix for the nested container in your HTML */
.container .container {
    margin: 0;
    padding: 0;
    max-width: none;
    box-shadow: none;
}

/* --- 2. HEADER SECTION (Dark Gray Box) --- */
.header{
    display: flex;
    align-items: center;
    margin-bottom:10px;
    gap: 10px;

}

.header .profile-image img{
    width:100px;
    height: 100px;
    border-radius: 5%;
}


.header .profile-info {
    color: #000;
    width: 50%;
    text-align: left;
    margin-bottom: 0; /* Connects directly to the Summary section below */
}

.name {
    font-size: 32pt;
    font-weight: 700;
    margin-bottom: 10px;
    color: #000; /* Ensure name is white on dark background */
    text-transform: uppercase;
    letter-spacing: 1px;
    line-height: 1;
}

.contact-info {
    font-size: 10pt;
    color: #000; /* Light grey text */
    text-transform: uppercase;
    letter-spacing: 1.5px;
    font-weight: 500;
}

/* --- 3. PROFILE IMAGE (The Sidebar Magic) --- */
/* Target the image inside the FIRST section (Summary) */
.section:nth-of-type(1) .profile-image {
    position: absolute; /* Take it out of the normal text flow */
    top: 0;
    left: 0;
    width: 320px; /* Width of the sidebar */
    height: 450px; /* Height covers both Header and Summary areas */
    z-index: 10;
    overflow: hidden;
    background-color: #ddd; /* Fallback color */
}

.section:nth-of-type(1) .profile-image img {
    width: 100%; /* Changed from 100px to fill container */
    height: 100%; /* Changed from 100px to fill container */
    object-fit: cover; /* Ensures the photo fills the box perfectly */
    border-radius: 0;  /* Remove any circles, we want a square block */
    border: none;
    padding: 0;
}

/* --- 4. SUMMARY SECTION (Teal Box) --- */
/* Target the FIRST section */
.section:nth-of-type(1) {
    /* Push content right to align with Header */
    margin-left: 320px; 
    
    background-color: #6CC5D6; /* Teal Background */
    color: #fff;
    padding: 30px 40px;
    margin-bottom: 40px; /* Space before Experience starts */
    min-height: 150px; /* Ensure it looks like a solid block */
}

/* Hide the default black divider in the teal box */
.section:nth-of-type(1) .section-divider {
    display: none;
}

/* Style the "SUMMARY" title to look like "Profile Summary" */
.section:nth-of-type(1) .section-title {
    color: #fff;
    font-size: 16pt;
    font-weight: 700;
    text-transform: capitalize;
    margin-bottom: 15px;
    border: none;
}

.section:nth-of-type(1) .summary-text {
    font-size: 11pt;
    line-height: 1.6;
    text-align: left;
    color: #fff;
}

.section:nth-of-type(1) .additional {
    margin-top: 10px;
    display: block;
    color: #e0f7fa; /* Lighter teal for contrast */
    font-size: 10pt;
}

/* --- 5. STANDARD SECTIONS (Experience, Projects, Education) --- */
/* Target all sections EXCEPT the first one */
.section:not(:nth-of-type(1)) {
    clear: both;
}

.section:not(:nth-of-type(1)) .section-title {
    font-size: 14pt;
    font-weight: 700;
    color: #4a4a4a;
    text-transform: uppercase;
    border-bottom: 3px solid #6CC5D6; /* Teal underline */
    display: inline-block;
    padding-bottom: 5px;
    margin-bottom: 20px;
    width: 100%; /* Full width underline */
}

.section:not(:nth-of-type(1)) .section-divider {
    display: none; /* We use the border-bottom above instead */
}

/* --- 6. JOB / CONTENT STYLING --- */
.job, .education-item {
    margin-bottom: 25px;
}

.company-line {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 5px;
}

.company, .university {
    font-size: 13pt;
    font-weight: 700;
    color: #333;
}

.location {
    font-size: 10pt;
    color: #999;
    font-weight: normal;
}

.role-line, .degree-line {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.role, .degree {
    font-size: 11pt;
    font-weight: 600;
    color: #6CC5D6; /* Teal accent for roles */
    font-style: normal;
    text-transform: uppercase;
}

.dates {
    font-size: 10pt;
    color: #666;
    font-style: italic;
}

/* List Styling */
ul {
    list-style: none; /* Remove default bullets */
    padding-left: 0;
    margin: 0;
}

li {
    position: relative;
    padding-left: 20px;
    margin-bottom: 8px;
    line-height: 1.5;
    color: #555;
    text-align: left;
}

li:before {
    content: "•"; /* Custom colored bullet */
    color: #6CC5D6; /* Teal Bullet */
    font-weight: bold;
    position: absolute;
    left: 0;
    font-size: 1.2em;
    line-height: 1.2em;
}

/* Skills Grid */
.skills-section {
    line-height: 1.8;
}
.skills-section strong {
    color: #333;
    font-weight: 700;
}</style>`,

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

export const DEFAULT_TEMPLATE = 'classic';
