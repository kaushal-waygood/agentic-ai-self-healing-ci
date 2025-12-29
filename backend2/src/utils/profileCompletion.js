export function checkProfileCompletion(student) {
  if (!student) return { complete: false, reasons: ['Student not found'] };

  const reasons = [];

  if (!student.fullName) reasons.push('Full name missing');
  if (!student.email) reasons.push('Email missing');
  if (!student.jobRole) reasons.push('Job role missing');
  if (!student.location) reasons.push('Location missing');

  if (!Array.isArray(student.skills) || student.skills.length === 0)
    reasons.push('At least one skill required');

  if (!Array.isArray(student.education) || student.education.length === 0)
    reasons.push('Education details required');

  const hasExperience =
    Array.isArray(student.experience) && student.experience.length > 0;
  const hasProjects =
    Array.isArray(student.projects) && student.projects.length > 0;

  if (!hasExperience && !hasProjects)
    reasons.push('Experience or projects required');

  return {
    complete: reasons.length === 0,
    reasons,
  };
}
