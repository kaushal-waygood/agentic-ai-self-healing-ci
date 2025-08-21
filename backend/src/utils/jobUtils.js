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
export function convertSalaryToYearly(amount, period) {
  switch (period) {
    case 'HOUR':
      return amount * 40 * 52;
    case 'DAY':
      return amount * 5 * 52;
    case 'WEEK':
      return amount * 52;
    case 'MONTH':
      return amount * 12;
    case 'YEAR':
    default:
      return amount;
  }
}

// Helper function to calculate match score (0-100)
export function calculateMatchScore(
  job,
  preferences = {},
  jobRole = '',
  skills = [],
  experience = [],
  education = [],
) {
  let score = 0;
  const totalPossible = 100;
  let points = 0;

  // If no preferences exist, calculate score based on profile data
  if (!preferences || Object.keys(preferences).length === 0) {
    // Job Role Match (30 points max)
    if (jobRole && job.title) {
      const roleMatchStrength = getMatchStrength(job.title, jobRole);
      points += roleMatchStrength * 30;
    }

    // Skills Match (30 points max)
    if (
      skills.length > 0 &&
      (job.description || job.qualifications || job.tags)
    ) {
      const jobText = [
        job.description || '',
        ...(job.qualifications || []),
        ...(job.tags || []),
      ]
        .join(' ')
        .toLowerCase();

      const matchedSkills = skills.filter(
        (skill) => skill.skill && jobText.includes(skill.skill.toLowerCase()),
      );
      points += (matchedSkills.length / skills.length) * 30;
    }

    // Experience Match (20 points max)
    if (experience.length > 0) {
      const jobText = `${job.title || ''} ${
        job.description || ''
      }`.toLowerCase();
      const matchedExperience = experience.filter(
        (exp) =>
          (exp.title && jobText.includes(exp.title.toLowerCase())) ||
          (exp.designation && jobText.includes(exp.designation.toLowerCase())),
      );
      points += (matchedExperience.length / experience.length) * 20;
    }

    // Education Match (20 points max)
    if (education.length > 0 && (job.description || job.qualifications)) {
      const jobText = `${job.description || ''} ${
        job.qualifications || ''
      }`.toLowerCase();
      const matchedEducation = education.filter(
        (edu) =>
          (edu.fieldOfStudy &&
            jobText.includes(edu.fieldOfStudy.toLowerCase())) ||
          (edu.degree && jobText.includes(edu.degree.toLowerCase())),
      );
      points += (matchedEducation.length / education.length) * 20;
    }

    return Math.min(Math.round(points), 100);
  }

  // Preference-based scoring (original logic with enhancements)

  // Location match (20 points)
  if (preferences.isRemote && job.isRemote) {
    points += 20;
  } else if (preferences.preferedCountries?.length > 0) {
    const countryMatch = preferences.preferedCountries.some(
      (c) => job.country && job.country.toLowerCase().includes(c.toLowerCase()),
    );

    if (countryMatch) {
      points += 10;

      // City match (additional 10 points if country matches)
      if (preferences.preferedCities?.length > 0 && job.location?.city) {
        const cityMatch = preferences.preferedCities.some((c) =>
          job.location.city.toLowerCase().includes(c.toLowerCase()),
        );
        if (cityMatch) points += 10;
      }
    }
  }

  // Job type match (15 points)
  if (preferences.preferedJobTypes?.length && job.jobTypes?.length) {
    const matchingTypes = job.jobTypes.filter((type) =>
      preferences.preferedJobTypes.includes(type),
    );
    if (matchingTypes.length > 0) {
      points += 15;
    }
  }

  // Title match (15 points)
  if (preferences.preferedJobTitles?.length) {
    const titleMatch = preferences.preferedJobTitles.some(
      (title) =>
        job.title && job.title.toLowerCase().includes(title.toLowerCase()),
    );

    if (titleMatch) {
      points += 15;
    } else if (
      jobRole &&
      job.title &&
      job.title.toLowerCase().includes(jobRole.toLowerCase())
    ) {
      // Fallback to jobRole if no title matches
      points += 10;
    }
  }

  // Salary match (15 points)
  if (preferences.preferedSalary && job.salary) {
    const prefMinYearly = convertSalaryToYearly(
      preferences.preferedSalary.min,
      preferences.preferedSalary.period,
    );
    const jobMinYearly = convertSalaryToYearly(
      job.salary.min || 0,
      job.salary.period || 'YEAR',
    );

    if (jobMinYearly >= prefMinYearly) {
      points += 15;
    } else if (jobMinYearly >= prefMinYearly * 0.8) {
      points += 10;
    } else if (jobMinYearly >= prefMinYearly * 0.6) {
      points += 5;
    }
  }

  // Skills match (20 points)
  if (preferences.mustHaveSkills?.length > 0) {
    const jobText = [
      job.description || '',
      ...(job.qualifications || []),
      ...(job.tags || []),
    ]
      .join(' ')
      .toLowerCase();

    const matchedSkills = preferences.mustHaveSkills.filter((skill) =>
      jobText.includes(skill.skill.toLowerCase()),
    );
    points += (matchedSkills.length / preferences.mustHaveSkills.length) * 20;
  }

  // Experience match (10 points)
  if (preferences.preferedExperienceLevel) {
    const prefExpLevel = getExperienceLevelValue(
      preferences.preferedExperienceLevel,
    );
    const jobExpLevel = job.experience || 0;

    if (jobExpLevel <= prefExpLevel) {
      points += 10;
    } else if (jobExpLevel <= prefExpLevel + 2) {
      points += 5;
    }
  }

  // Visa sponsorship (5 points)
  if (preferences.visaSponsorshipRequired && job.visaSponsorshipAvailable) {
    points += 5;
  }

  return Math.min(Math.round((points / totalPossible) * 100), 100);
}

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

// export function convertSalaryToYearly(amount, period) {
//   if (!amount) return 0;

//   const multipliers = {
//     HOUR: 2080, // 40 hrs/week * 52 weeks
//     DAY: 260, // 5 days/week * 52 weeks
//     WEEK: 52,
//     MONTH: 12,
//     YEAR: 1,
//   };

//   return amount * (multipliers[convertSalaryToYearlyperiod] || 1);
// }
