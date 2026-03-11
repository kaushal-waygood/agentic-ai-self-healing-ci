# Tailor-Style CV, Cover Letter & Email Generation – Wireframe

This document describes the full flow used by the `/tailor` API and the AI Job Agents "Generate" button. Both now use the same pipeline for consistent, high-quality output.

---

## Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        TAILORED APPLICATION GENERATION                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│  Input: Job + Candidate (profile or CV) + Preferences                             │
│  Output: tailoredCV, tailoredCoverLetter, applicationEmail                       │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Entry Points

| Entry Point | Route / Trigger | Creates | Pipeline |
|-------------|-----------------|---------|----------|
| **Manual Tailor** | `POST /students/applications/tailor` | StudentTailoredApplication | tailoredApply.background.js |
| **Agent Generate** | `POST /pilotagent/get/:agentId/jobs/:jobId/generate` | StudentTailoredApplication | tailoredApply.background.js |

---

## 2. Data Flow

```
┌──────────────┐     ┌─────────────────────┐     ┌──────────────────────────────┐
│   REQUEST    │────▶│  Create Pending     │────▶│  processTailoredApplication   │
│  (job + CV)  │     │  StudentTailoredApp │     │  (background)                 │
└──────────────┘     └─────────────────────┘     └──────────────────────────────┘
                              │                                    │
                              │ 202 Accepted                       │
                              ▼                                    ▼
                     ┌─────────────────────┐     ┌──────────────────────────────┐
                     │  Return applicationId│     │  A. Parse candidate           │
                     └─────────────────────┘     │  B. Generate CV JSON           │
                                                 │  C. Render CV HTML + template   │
                                                 │  D. Generate Cover Letter      │
                                                 │  E. Generate Email             │
                                                 │  F. Save + notify               │
                                                 └──────────────────────────────┘
```

---

## 3. Generation Pipeline (tailoredApply.background.js)

### Step 0: Ensure Structured Candidate

```
candidate (JSON string or object)
        │
        ├── Has experience[]? ──▶ Use as structuredCandidate
        │
        └── Raw CV text? ──▶ AI Parse ──▶ Extract education, experience, skills, projects
```

### Step A: CV JSON Generation

| Component | File | Purpose |
|-----------|------|---------|
| **Prompt** | `prompt/generateCVPrompt.js` | Job description + structured candidate → JSON |
| **Output** | JSON | summary, experience[], projects[], education[], skills, atsScore, atsScoreReasoning |

### Step B: CV HTML Rendering

| Component | File | Purpose |
|-----------|------|---------|
| **Renderer** | `utils/cv/cvRenderer.js` | JSON → semantic HTML (sections: SUMMARY, EXPERIENCE, PROJECTS, EDUCATION, SKILLS) |
| **Template** | `utils/cvTemplate.js` + `utils/cv/cssTemplates.js` | Wrap HTML with CSS template |
| **Templates** | classic, tech, sales, modern | Multiple CV styles |

```
parsedCv (JSON) ──▶ renderResumeHtml() ──▶ innerHtml
                                              │
                                              ▼
                        wrapCVHtml(innerHtml, { title, template }) ──▶ fullCvHtml
```

### Step C: Cover Letter

| Component | File | Purpose |
|-----------|------|---------|
| **Prompt** | `prompt/generateCoverletter.js` | Job title + candidate + preferences → HTML |
| **Template** | `wrapCVHtml(clHtml, 'Cover Letter')` | Wrap with CV template for consistent styling |

### Step D: Email

| Component | File | Purpose |
|-----------|------|---------|
| **Prompt** | `prompt/generateEmail.js` | Job + candidate → SUBJECT / BODY / SIGNATURE |
| **Parser** | `processEmailResponse()` | Extract subject, body, signature via regex |
| **Template** | `utils/emailTemplate.js` | `wrapEmailHtml(subject, body, signature)` → HTML |

### Step E: ATS Score

| Component | File | Purpose |
|-----------|------|---------|
| **Calculator** | `utils/atsScore.js` | `calculateATSScore(parsedCv, jobDescription)` |
| **Fallback** | parsedCv.atsScore | Use AI-provided score if present |

---

## 4. Output Structure (StudentTailoredApplication)

```javascript
{
  tailoredCV: {
    ...parsedCv,           // summary, experience, projects, education, skills
    cv: fullCvHtml,       // Full HTML with template
    atsScore: 85,
    atsScoreReasoning: "..."
  },
  tailoredCoverLetter: {
    html: coverLetterHtml
  },
  applicationEmail: {
    subject: "Application for ...",
    body: "...",
    signature: "Name",
    html: wrapEmailHtml(...)
  },
  status: 'completed'
}
```

---

## 5. CV Templates Available

| Template | File | Style |
|----------|------|-------|
| **classic** | cssTemplates.js | Times New Roman, traditional |
| **tech** | cssTemplates.js | Tech-focused layout |
| **sales** | cssTemplates.js | Sales-oriented |
| **modern** | cssTemplates.js | Modern grid layout |

Default: `classic`. Template can be passed to `wrapCVHtml(bodyHtml, { title, template })`.

---

## 6. File Reference

| Purpose | Path |
|---------|------|
| Main pipeline | `backend/src/utils/tailoredApply.background.js` |
| CV prompt | `backend/src/prompt/generateCVPrompt.js` |
| CV renderer | `backend/src/utils/cv/cvRenderer.js` |
| CV templates | `backend/src/utils/cvTemplate.js`, `backend/src/utils/cv/cssTemplates.js` |
| Cover letter prompt | `backend/src/prompt/generateCoverletter.js` |
| Email prompt | `backend/src/prompt/generateEmail.js` |
| Email template | `backend/src/utils/emailTemplate.js` |
| ATS score | `backend/src/utils/atsScore.js` |

---

## 7. Agent Flow (AI Job Agents)

```
User expands agent accordion
        │
        ▼
Jobs listed (from getAgentJobs API)
        │
        ▼
User clicks "Generate" on a job
        │
        ▼
POST /pilotagent/get/:agentId/jobs/:jobId/generate
        │
        ├── Validate agent, job, no duplicate
        ├── buildEffectiveStudentProfile(profile, agent)
        ├── buildApplicationData(job, effectiveStudent, '')
        ├── Create StudentTailoredApplication (pending, flag: 'agent')
        └── processTailoredApplication(...) [same as /tailor]
        │
        ▼
Docs appear in My Docs → Applications (with "from: agent" badge)
```

---

## 8. Adding New Templates

1. Add CSS to `backend/src/utils/cv/cssTemplates.js`:
   ```javascript
   export const CV_TEMPLATES = {
     classic: `...`,
     tech: `...`,
     myNewTemplate: `/* your CSS */`,
   };
   ```

2. Use in `wrapCVHtml`:
   ```javascript
   wrapCVHtml(innerHtml, { title: jobTitle, template: 'myNewTemplate' });
   ```

3. `AVAILABLE_CV_TEMPLATES` in cvTemplate.js auto-includes new keys.
