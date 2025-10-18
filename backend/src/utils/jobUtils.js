import axios from 'axios';
import { config } from '../config/config.js';

export async function getFallbackJobsFromRapidAPI(req, res, preferences) {
  try {
    let queryParts = [];

    // Build query based on preferences
    if (preferences.preferedJobTitles?.length > 0) {
      queryParts.push(`(${preferences.preferedJobTitles.join(' OR ')})`);
    }

    if (preferences.mustHaveSkills?.length > 0) {
      queryParts.push(
        `(${preferences.mustHaveSkills.map((s) => s.skill).join(' OR ')})`,
      );
    }

    if (!preferences.isRemote && preferences.preferedCountries?.length > 0) {
      queryParts.push(
        `location:(${preferences.preferedCountries.join(' OR ')})`,
      );
    }

    const query = queryParts.join(' AND ') || 'Software Engineer';

    const response = await axios.get(config.rapidJobApi, {
      params: {
        query,
        page: req.query.page || 1,
        num_pages: 20,
      },
      headers: {
        'X-RapidAPI-Key': config.rapidApiKey,
        'X-RapidAPI-Host': config.rapidApiHost,
      },
    });

    const externalJobs = response.data.data || [];
    const processedJobs = [];

    for (const job of externalJobs) {
      const existing = await Job.findOne({ jobId: job.job_id });
      const experience = extractExperience(job.job_description);
      const qualifications = extractQualificationsFromDescription(
        job.job_description,
      );
      const responsibilities = extractResponsibilitiesFromDescription(
        job.job_description,
      );

      if (!existing) {
        const newJob = new Job({
          jobId: job.job_id,
          origin: 'EXTERNAL',
          logo: job.employer_logo,
          experience,
          qualification: qualifications,
          responsibilities,
          title: job.job_title,
          description: job.job_description,
          jobTypes: job.job_employment_types || [],
          company: job.employer_name,
          applyMethod: {
            method: 'URL',
            url: job.job_apply_link,
          },
          salary: {
            min: job.job_min_salary || 0,
            max: job.job_max_salary || 0,
            period: job.job_salary_period || 'YEAR',
          },
          location: {
            city: job.job_city,
            postalCode: job.job_postal_code || '',
            lat: job.job_latitude,
            lng: job.job_longitude,
          },
          jobAddress: job.job_location,
          country: job.job_country,
          tags: job.job_benefits || [],
          queries: [query],
        });

        const savedJob = await newJob.save();
        processedJobs.push(savedJob);
      } else {
        await Job.updateOne(
          { jobId: job.job_id },
          { $addToSet: { queries: query } },
        );
        processedJobs.push(existing); // Include existing one for scoring
      }
    }

    // Add match scores and sort
    const jobsWithScores = processedJobs.map((job) => ({
      ...job.toObject(),
      matchScore: calculateMatchScore(job, preferences),
    }));

    jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);

    // Pagination
    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 10);
    const paginatedJobs = jobsWithScores.slice(
      (page - 1) * limit,
      page * limit,
    );

    return res.status(200).json({
      success: true,
      jobs: paginatedJobs,
      pagination: {
        total: jobsWithScores.length,
        page,
        limit,
        totalPages: Math.ceil(jobsWithScores.length / limit),
      },
      source: 'external',
      message:
        jobsWithScores.length > 0
          ? 'Showing external job listings that match your preferences'
          : 'No matching jobs found in our database or external sources',
    });
  } catch (error) {
    console.error('Error fetching fallback jobs from RapidAPI:', error.message);
    return res.status(200).json({
      success: true,
      jobs: [],
      pagination: {
        total: 0,
        page: parseInt(req.query.page || 1),
        limit: parseInt(req.query.limit || 10),
        totalPages: 0,
      },
      source: 'none',
      message:
        'No matching jobs found. Try adjusting your preferences or check back later.',
    });
  }
}

// Helper function to convert salary to yearly for comparison
// export function convertSalaryToYearly(amount, period) {
//   switch (period) {
//     case 'HOUR':
//       return amount * 40 * 52;
//     case 'DAY':
//       return amount * 5 * 52;
//     case 'WEEK':
//       return amount * 52;
//     case 'MONTH':
//       return amount * 12;
//     case 'YEAR':
//     default:
//       return amount;
//   }
// }

// export function calculateMatchScore(
//   job,
//   preferences,
//   jobRole,
//   skills,
//   experience,
// ) {
//   let score = 0;

//   const titles = [
//     ...(preferences.preferredJobTitles || []),
//     jobRole,
//     preferences.jobTitle,
//   ].filter(Boolean);
//   if (titles.some((t) => job.title?.toLowerCase().includes(t.toLowerCase()))) {
//     score += 30;
//   }

//   const mustHaveSkills = [
//     ...(preferences.mustHaveSkills || []),
//     ...(preferences.uploadedCVData?.skills || []),
//     ...(skills || []),
//   ]
//     .map((s) => s.skill?.toLowerCase())
//     .filter(Boolean);
//   const skillMatch =
//     job.qualifications?.filter((q) =>
//       mustHaveSkills.some((s) => q?.toLowerCase().includes(s)),
//     ).length || 0;
//   score += (skillMatch / (mustHaveSkills.length || 1)) * 40;

//   if (
//     (preferences.isRemote || preferences.country) &&
//     (job.isRemote ||
//       job.country?.toLowerCase() === preferences.country?.toLowerCase())
//   ) {
//     score += 20;
//   }

//   if (
//     preferences.preferredJobTypes?.includes(job.jobTypes?.[0]) ||
//     preferences.employmentType?.toLowerCase() ===
//       job.jobTypes?.[0]?.toLowerCase()
//   ) {
//     score += 10;
//   }

//   const jobExpYears = job.experience || 0;
//   const maxExp = Math.max(
//     ...experience.map((exp) => exp.experienceYrs || 0),
//     0,
//   );
//   if (jobExpYears <= maxExp + 1) {
//     score += 10;
//   }

//   return Math.min(score, 100);
// }

// Helper function to convert experience level to numeric value
function getExperienceLevelValue(level) {
  switch (level) {
    case 'ENTRY_LEVEL':
      return 0;
    case 'MID_LEVEL':
      return 3;
    case 'SENIOR':
      return 5;
    case 'EXPERT':
      return 8;
    default:
      return 0;
  }
}

// Helper function to calculate match strength between strings
function getMatchStrength(text, searchTerm) {
  if (!text || !searchTerm) return 0;

  const textLower = text.toLowerCase();
  const termLower = searchTerm.toLowerCase();

  if (textLower === termLower) return 1;
  if (textLower.includes(termLower)) return 0.8;

  // Tokenize and check partial matches
  const textWords = textLower.split(/\s+/);
  const termWords = termLower.split(/\s+/);

  const matchingWords = termWords.filter((word) =>
    textWords.some((tWord) => tWord.includes(word)),
  );

  return matchingWords.length / termWords.length;
}

// NEW
// src/utils/jobUtils.js
export const convertSalaryToYearly = (amount, period) => {
  if (!amount || !period) return 0;

  const conversions = {
    HOUR: amount * 40 * 52, // 40 hours/week * 52 weeks
    DAY: amount * 5 * 52, // 5 days/week * 52 weeks
    WEEK: amount * 52, // 52 weeks/year
    MONTH: amount * 12, // 12 months/year
    YEAR: amount,
  };

  return conversions[period.toUpperCase()] || amount;
};

export const calculateMatchScore = (job, student) => {
  try {
    let score = 0;
    const maxScore = 100;

    // Safe access to properties with defaults
    const jobSkills = job.tags || job.skills || [];
    const studentSkills = student.skills || [];
    const studentSkillNames = studentSkills
      .map((s) => s.skill || s)
      .filter(Boolean);

    const jobLocation = job.location || {};
    const studentPreferences = student.jobPreferences || {};
    const preferredLocations = studentPreferences.preferedLocations || [];
    const preferredCountries = studentPreferences.preferedCountries || [];

    // 1. Skill matching (40 points)
    if (jobSkills.length > 0 && studentSkillNames.length > 0) {
      const matchingSkills = jobSkills.filter((skill) =>
        studentSkillNames.some(
          (studentSkill) =>
            studentSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(studentSkill.toLowerCase()),
        ),
      );
      const skillMatchRatio =
        matchingSkills.length / Math.max(jobSkills.length, 1);
      score += skillMatchRatio * 40;
      console.log(
        `   Skills: ${matchingSkills.length}/${
          jobSkills.length
        } matched (${Math.round(skillMatchRatio * 100)}%)`,
      );
    }

    // 2. Location matching (20 points)
    if (preferredLocations.length > 0 || preferredCountries.length > 0) {
      const jobCountry = job.country || '';
      const jobCity = jobLocation.city || '';
      const jobState = jobLocation.state || '';

      const locationMatch =
        preferredLocations.some(
          (loc) =>
            jobCity.toLowerCase().includes(loc.toLowerCase()) ||
            jobState.toLowerCase().includes(loc.toLowerCase()),
        ) ||
        preferredCountries.some((country) =>
          jobCountry.toLowerCase().includes(country.toLowerCase()),
        );

      if (locationMatch) {
        score += 20;
        console.log(`   Location: Match found`);
      }
    }

    // 3. Remote work preference (10 points)
    if (studentPreferences.isRemote && job.isRemote) {
      score += 10;
      console.log(`   Remote: Match`);
    }

    // 4. Job type matching (10 points)
    const preferredJobTypes = studentPreferences.preferedJobTypes || [];
    const jobTypes = job.jobTypes || [];
    if (preferredJobTypes.length > 0 && jobTypes.length > 0) {
      const hasMatchingType = jobTypes.some((type) =>
        preferredJobTypes.includes(type),
      );
      if (hasMatchingType) {
        score += 10;
        console.log(`   Job Type: Match`);
      }
    }

    // 5. Salary expectations (20 points)
    const preferredSalary = studentPreferences.preferedSalary || {};
    if (preferredSalary.min && job.salary) {
      const jobMinSalary = convertSalaryToYearly(
        job.salary.min,
        job.salary.period || 'YEAR',
      );
      const studentMinSalary = convertSalaryToYearly(
        preferredSalary.min,
        preferredSalary.period || 'YEAR',
      );

      if (jobMinSalary >= studentMinSalary) {
        score += 20;
        console.log(`   Salary: Meets expectations`);
      } else if (jobMinSalary >= studentMinSalary * 0.8) {
        score += 10; // Partial match for slightly lower salary
        console.log(`   Salary: Close to expectations`);
      }
    }

    const finalScore = Math.min(score, maxScore);
    console.log(`   Final Score: ${finalScore}/100`);
    return finalScore;
  } catch (error) {
    console.error('❌ Error in calculateMatchScore:', error);
    console.log('Job data:', {
      id: job._id,
      title: job.title,
      company: job.company,
      tags: job.tags,
      skills: job.skills,
      location: job.location,
      salary: job.salary,
      jobTypes: job.jobTypes,
      isRemote: job.isRemote,
    });
    console.log('Student data:', {
      skills: student.skills,
      jobPreferences: student.jobPreferences,
    });
    return 0; // Return 0 if calculation fails
  }
};
