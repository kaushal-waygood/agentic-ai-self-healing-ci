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

    const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
      params: {
        query,
        page: req.query.page || 1,
        num_pages: 20,
      },
      headers: {
        'X-RapidAPI-Key': '0d3678f4demsh0fdb835e7b93d0cp15bf60jsnd8ee05c7fc47',
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
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
export function calculateMatchScore(job, preferences) {
  let score = 0;
  const totalPossible = 100;
  let points = 0;

  // Location match (20 points)
  if (preferences.isRemote && job.isRemote) {
    points += 20;
  } else if (
    preferences.preferedCountries &&
    preferences.preferedCountries.length > 0
  ) {
    if (
      preferences.preferedCountries.some(
        (c) =>
          job.country && job.country.toLowerCase().includes(c.toLowerCase()),
      )
    ) {
      points += 10;
      if (preferences.preferedCities && preferences.preferedCities.length > 0) {
        if (
          preferences.preferedCities.some(
            (c) =>
              job.location?.city &&
              job.location.city.toLowerCase().includes(c.toLowerCase()),
          )
        ) {
          points += 10;
        }
      }
    }
  }

  // Job type match (15 points)
  if (preferences.preferedJobTypes && job.jobTypes) {
    const matchingTypes = job.jobTypes.filter((type) =>
      preferences.preferedJobTypes.includes(type),
    );
    if (matchingTypes.length > 0) {
      points += 15;
    }
  }

  // Title match (15 points)
  if (
    preferences.preferedJobTitles &&
    preferences.preferedJobTitles.length > 0
  ) {
    if (
      preferences.preferedJobTitles.some(
        (title) =>
          job.title && job.title.toLowerCase().includes(title.toLowerCase()),
      )
    ) {
      points += 15;
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
  if (preferences.mustHaveSkills && preferences.mustHaveSkills.length > 0) {
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
    let prefExpLevel;
    switch (preferences.preferedExperienceLevel) {
      case 'ENTRY_LEVEL':
        prefExpLevel = 0;
        break;
      case 'MID_LEVEL':
        prefExpLevel = 3;
        break;
      case 'SENIOR':
        prefExpLevel = 5;
        break;
      default:
        prefExpLevel = 0;
    }

    if (job.experience <= prefExpLevel) {
      points += 10;
    } else if (job.experience <= prefExpLevel + 2) {
      points += 5;
    }
  }

  // Visa sponsorship (5 points)
  if (preferences.visaSponsorshipRequired && job.visaSponsorshipAvailable) {
    points += 5;
  }

  return Math.min(Math.round((points / totalPossible) * 100), 100);
}
