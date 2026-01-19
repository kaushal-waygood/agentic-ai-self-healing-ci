/**
 * Renders HTML for both Professional and Fresher CVs.
 */
export const renderResumeHtml = (
  data,
  profileImage,
  fullName,
  email,
  phoneNumber,
  location,
) => {
  // 1. Conditional Summary
  const summaryHtml = data.summary
    ? `
    <div class="section">
      <div class="section-title">SUMMARY</div>
      <div class="section-divider"></div>
      <div class="summary-text">
        <p>${data.summary}</p>
        ${data.additionalInfo ? `<p class="additional"><strong>Additional:</strong> ${data.additionalInfo}</p>` : ''}
      </div>
    </div>
  `
    : '';

  // 2. Experience Section (Only if items exist)
  const experienceHtml =
    data.experience && data.experience.length > 0
      ? `
    <div class="section">
      <div class="section-title">EXPERIENCE</div>
      <div class="section-divider"></div>
      <ul>
      ${data.experience
        .map(
          (job) => `
        <li class="item-block">
          <div class="header-line">
            <span class="bold-text">${job.company}</span>
            <span class="right-text">${job.location}</span>
          </div>
          <div class="sub-line">
            <span class="italic-text">${job.role}</span>
            <span class="right-text">${job.dates}</span>
          </div>
          <ul>
            ${job.bullets.map((bullet) => `<li>${bullet}</li>`).join('')}
          </ul>
        </li>
      `,
        )
        .join('')}
        </ul>
    </div>
  `
      : '';

  // 3. Projects Section (Only if items exist)
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
          <li>
            <p><strong>${proj.name}:</strong></p>
            <p><strong>Tech Stack:</strong> ${proj.techStack}</p>
            <p><strong>Achievements:</strong> </p>
            <ul class="achievements">
            ${proj.achievements.map((achievement) => `<li>${achievement}</li>`).join('')}
            </ul>
          </li>
        `,
          )
          .join('')}
      </ul>
    </div>
  `
      : '';

  // 4. Education Section (Fresher Friendly: Includes Coursework and Details)
  const educationHtml =
    data.education && data.education.length > 0
      ? `
    <div class="section">
      <div class="section-title">EDUCATION</div>
      <div class="section-divider"></div>
      <ul>
      ${data.education
        .map(
          (edu) => `
        <li>
          <div class="header-line">
            <span class="bold-text">${edu.school}</span>
            <span class="right-text">${edu.location || ''}</span>
          </div>
          <div class="sub-line">
            <span class="italic-text">${edu.degree}</span>
            <span class="right-text">${edu.year}</span>
          </div>
          ${edu.details ? `<p class="edu-details">${edu.details}</p>` : ''}
          
        </li>
        <li>${
          edu.coursework && edu.coursework.length > 0
            ? `
            <p class="coursework"><strong>Relevant Coursework:</strong> ${edu.coursework.join(', ')}</p>
          `
            : ''
        }
        </li>
      `,
        )
        .join('')}
      </ul>
        </div>
  `
      : '';

  // 5. Skills Section (Handles Object categories)
  let skillsContent = '';
  if (
    data.skills &&
    typeof data.skills === 'object' &&
    !Array.isArray(data.skills)
  ) {
    skillsContent = Object.entries(data.skills)
      .map(
        ([category, list]) =>
          `<div><strong>${category}:</strong> ${list}</div>`,
      )
      .join('');
  } else if (Array.isArray(data.skills)) {
    skillsContent = `<div>${data.skills.join(', ')}</div>`;
  }

  const skillsHtml = skillsContent
    ? `
    <div class="section">
      <div class="section-title">SKILLS</div>
      <div class="section-divider"></div>
      <div class="skills-grid">${skillsContent}</div>
    </div>
  `
    : '';

  // 6. Final Template Assembly
  return `
    <div class="resume-container">
      <div class="header">
        ${profileImage ? `<div class="profile-image"><img src="${profileImage}" /></div>` : ''}
        <div class="profile-info">
          <h1>${fullName}</h1>
          <p><a href="mailto:${email}">${email}</a> ${phoneNumber ? `| <a href="tel:${phoneNumber}">${phoneNumber}</a>` : ''} ${location ? `| ${location}` : ''}</p>
        </div>
      </div>

      ${summaryHtml}
      ${experienceHtml}
      ${projectsHtml}
      ${educationHtml}
      ${skillsHtml}
    </div>
  `;
};
