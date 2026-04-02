import { buildJobContextString } from './jobContext.js';

export const buildApplicationData = (
  job,
  effectiveStudent,
  finalTouch = '',
) => {
  return {
    job: {
      title: job.title || '',
      company: job.company || '',
      description: job.description || '',
      country: job.country || '',
      location: {
        city: job.location?.city || '',
        state: job.location?.state || '',
      },
      isRemote: !!(job.remote ?? job.isRemote),
      jobTypes: Array.isArray(job.jobTypes) ? job.jobTypes : [],
      qualifications: Array.isArray(job.qualifications)
        ? job.qualifications
        : [],
      responsibilities: Array.isArray(job.responsibilities)
        ? job.responsibilities
        : [],
      tags: Array.isArray(job.tags) ? job.tags : [],
      applyMethod: job.applyMethod || {},
      salary: job.salary || null,
      jobContextString: buildJobContextString(job),
    },
    candidate: JSON.stringify(effectiveStudent),
    coverLetter: '',
    preferences: finalTouch,
  };
};
