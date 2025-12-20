// src/utils/cvCondense.js

export function condenseExperience(cvHtml) {
  const MAX_JOBS = 3;
  const MAX_BULLETS_PER_JOB = 3;

  // limit number of job blocks
  let jobCount = 0;
  cvHtml = cvHtml.replace(/<div class="job">([\s\S]*?)<\/div>/g, (match) => {
    jobCount += 1;
    if (jobCount > MAX_JOBS) return '';
    return match;
  });

  // limit bullets per job
  cvHtml = cvHtml.replace(
    /(<ul>)([\s\S]*?)(<\/ul>)/g,
    (_, open, items, close) => {
      const bullets = items.match(/<li>[\s\S]*?<\/li>/g) || [];
      return open + bullets.slice(0, MAX_BULLETS_PER_JOB).join('') + close;
    },
  );

  return cvHtml;
}
