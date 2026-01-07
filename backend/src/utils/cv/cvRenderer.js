// utils/cvRenderer.js

/**
 * Converts the AI-generated JSON data into the HTML structure
 * required by your CSS templates.
 */
export const renderResumeHtml = (
  data,
  profileImage,
  fullName,
  email,
  phoneNumber,
  location,
) => {
  // 1. Render Experience Items
  const experienceHtml = data.experience
    .map(
      (job) => `
    <div class="job">
      <div class="company-line">
        <span class="company">${job.company}</span>
        <span class="location">${job.location}</span>
      </div>
      <div class="role-line">
        <span class="role">${job.role}</span>
        <span class="dates">${job.dates}</span>
      </div>
      <ul>
        ${job.bullets.map((bullet) => `<li>${bullet}</li>`).join('')}
      </ul>
    </div>
  `,
    )
    .join('');

  // 2. Render Projects
  const projectsHtml =
    data.projects && data.projects.length > 0
      ? `
    <div class="section">
      <div class="section-title">PROJECTS</div>
      <div class="section-divider"></div>
      <ul>
        ${data.projects
          .map(
            (proj) => `
          <li><strong>${proj.name}:</strong> ${proj.description}</li>
        `,
          )
          .join('')}
      </ul>
    </div>
  `
      : '';

  // 3. Render Education
  const educationHtml = data.education
    .map(
      (edu) => `
    <div class="education-item">
      <ul>
        <li><strong>${edu.degree}</strong>, ${edu.school} (${edu.year})</li>
      </ul>
    </div>
  `,
    )
    .join('');

  // 4. Render Skills
  // Handle both array format or object format from AI
  let skillsContent = '';
  if (typeof data.skills === 'object' && !Array.isArray(data.skills)) {
    skillsContent = Object.entries(data.skills)
      .map(
        ([category, skillList]) =>
          `<div><strong>${category}:</strong> ${skillList}</div>`,
      )
      .join('');
  } else if (Array.isArray(data.skills)) {
    skillsContent = data.skills.join(', ');
  }

  return `
    <div class="resume-container">
      <div class="header">

      ${
        profileImage
          ? `<div class="profile-image"><img src="${profileImage}" alt="Profile Image" /></div>`
          : ''
      }
        <div class="profile-info">
          <div class="name">
            <h1>${fullName}</h1>
          </div>
          <div class="contact-info">
            <p>${email} | ${phoneNumber} | ${location}</p>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">SUMMARY</div>
        <div class="section-divider"></div>
        
        

        <div class="summary-text">
          ${data.summary}
          ${
            data.additionalInfo
              ? `<span class="additional"><br><strong>Additional:</strong> ${data.additionalInfo}</span>`
              : ''
          }
        </div>
      </div>

      <div class="section">
        <div class="section-title">EXPERIENCE</div>
        <div class="section-divider"></div>
        ${experienceHtml}
      </div>

      ${projectsHtml}

      <div class="section">
        <div class="section-title">EDUCATION</div>
        <div class="section-divider"></div>
        ${educationHtml}
      </div>

      <div class="section">
        <div class="section-title">SKILLS</div>
        <div class="section-divider"></div>
        <div class="skills-section">
          ${skillsContent}
        </div>
      </div>
    </div>
  `;
};
