/** @format */

import { v4 as uuidv4 } from 'uuid';
import { Job } from '../models/jobs.model.js';
import { config } from '../config/config.js';
import axios from 'axios';
import {
  extractExperience,
  extractQualifications,
  extractQualificationsFromDescription,
  extractResponsibilitiesFromDescription,
} from '../utils/exprienceExtractor.js';

export const postManualJob = async (req, res) => {
  const { _id } = req.user;
  try {
    const {
      title,
      description,
      company,
      applyMethod,
      jobTypes,
      contractLength,
      salary,
      expectedHours,
      workingHoursMin,
      workingHoursMax,
      resumeRequired,
      coverLetterRequired,
      phoneRequired,
      language,
      applicationDeadline,
      jobAddress,
      country,
      location,
      tags,
      taxonomyAttributes,
      attributes,
      workPeriods,
    } = req.body;

    const jobData = {
      jobId: uuidv4(),
      origin: 'HOSTED',
      organizationId: _id,
      title,
      description,
      company,
      applyMethod,
      jobTypes,
      contractLength,
      salary,
      expectedHours,
      workingHoursMin,
      workingHoursMax,
      resumeRequired,
      coverLetterRequired,
      phoneRequired,
      language,
      applicationDeadline,
      jobAddress,
      country,
      location,
      tags,
      taxonomyAttributes,
      attributes,
      workPeriods,
    };

    const newJob = new Job({ ...jobData });
    await newJob.save();

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      job: newJob,
    });
  } catch (error) {
    console.error('Error posting job:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const fetchAndSaveRapidJobsUseLater = async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required',
    });
  }

  try {
    // Build search params
    const params = {
      query: `${query}`,
      page: 1,
      num_pages: 5, // Reduced from 20 to avoid hitting rate limits
    };

    const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
      params,
      headers: {
        'X-RapidAPI-Key':
          process.env.RAPIDAPI_KEY ||
          'c7ba6ca0c9mshc1e7b4827328e98p1be463jsn88e70a3f4bcc',
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },
    });

    const jobs = response.data.data;
    let savedCount = 0;
    let skippedCount = 0;
    let updatedCount = 0;

    // Process jobs sequentially to avoid race conditions and properly track counts
    for (const job of jobs) {
      try {
        // Check if job already exists with the same jobId
        const existingJob = await Job.findOne({ jobId: job.job_id });

        if (existingJob) {
          // Check if this query is already in the job's queries array
          if (!existingJob.queries.includes(query)) {
            // Add the new query to the existing job
            await Job.updateOne(
              { jobId: job.job_id },
              { $addToSet: { queries: query } },
            );
            updatedCount++;
          } else {
            // Job exists and already has this query - skip
            skippedCount++;
          }
          continue; // Skip to next job
        }

        // Extract job details
        const experience = extractExperience(job.job_description);
        const qualifications = extractQualifications(job.job_description);

        const jobData = {
          jobId: job.job_id,
          origin: 'EXTERNAL',
          publisher: job.job_publisher,

          // Core job info
          title: job.job_title,
          description: job.job_description,
          shortDescription: job.job_description.substring(0, 200) + '...',
          isRemote: job.job_is_remote || false,

          // Company info
          company: job.employer_name,
          companyType: job.employer_company_type,
          logo: job.employer_logo,
          companyWebsite: job.employer_website,
          companyLinkedIn: job.employer_linkedin,

          // Requirements
          qualifications: job.job_highlights?.Qualifications || [],
          responsibilities: job.job_highlights?.Responsibilities || [],

          jobRequiredExperience: {
            noExperienceRequired:
              job.job_required_experience?.no_experience_required || false,
            requiredExperienceInMonths:
              job.job_required_experience?.required_experience_in_months ||
              null,
            experienceMentioned:
              job.job_required_experience?.experience_mentioned || false,
            experiencePreferred:
              job.job_required_experience?.experience_preferred || false,
            yearsOfExperience: experience,
          },

          // Responsibilities
          responsibilities: job.job_highlights?.Responsibilities || [],

          // Employment details
          employmentType: job.job_employment_type || 'FULLTIME',
          employmentTypeText: job.job_employment_type_text || 'Full-time',

          // Salary
          salary: {
            min: job.job_min_salary || null,
            max: job.job_max_salary || null,
            currency: job.job_salary_currency || 'USD',
            period: job.job_salary_period || 'YEAR',
            isEstimated: !job.job_min_salary,
          },
          salaryDisclosed: !!job.job_min_salary,

          // Benefits
          benefits: job.job_benefits ? job.job_benefits.join(', ') : null,
          benefitsList: job.job_benefits || [],

          // Application details
          applyMethod: {
            method: 'URL',
            url: job.job_apply_link,
            isDirect: job.job_apply_is_direct || false,
          },
          applyOptions:
            job.apply_options?.map((option) => ({
              publisher: option.publisher,
              applyLink: option.apply_link,
              isDirect: option.is_direct,
            })) || [],
          applicationQualityScore: job.job_apply_quality_score || null,

          // Location
          location: {
            city: job.job_city,
            state: job.job_state,
            country: job.job_country || 'US',
            postalCode: job.job_postal_code || '',
            address: job.job_location,
            lat: job.job_latitude,
            lng: job.job_longitude,
          },
          locationText: job.job_location,

          // Dates
          postedAt: job.job_posted_at_datetime_utc
            ? new Date(job.job_posted_at_datetime_utc)
            : new Date(),
          postedAtTimestamp:
            job.job_posted_at_timestamp || Math.floor(Date.now() / 1000),
          postedHumanReadable: job.job_posted_human_readable || 'Just now',
          expiresAt: job.job_offer_expiration_datetime_utc
            ? new Date(job.job_offer_expiration_datetime_utc)
            : null,
          expiresAtTimestamp: job.job_offer_expiration_timestamp || null,

          // Classification
          industry: job.job_industry || null,
          occupationalCategory: job.job_occupational_categories?.[0] || null,
          onetSoc: job.job_onet_soc || null,
          onetJobZone: job.job_onet_job_zone || null,
          naicsCode: job.job_naics_code || null,
          naicsName: job.job_naics_name || null,

          // Metadata
          tags: job.job_benefits || [],
          queries: [query],
          taxonomyAttributes: [],
        };

        // Create new job
        await Job.create(jobData);
        savedCount++;
      } catch (error) {
        console.error(`Error processing job ${job.job_id}:`, error.message);
        skippedCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: 'Jobs processed successfully',
      stats: {
        totalReceived: jobs.length,
        saved: savedCount,
        updated: updatedCount,
        skipped: skippedCount,
      },
    });
  } catch (err) {
    console.error('Error in fetchAndSaveRapidJobs:', err.message);

    const status = err.response?.status || 500;
    const message =
      err.response?.data?.message || 'Failed to fetch and save jobs';

    res.status(status).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

export const fetchAndSaveRapidJobs = async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res
      .status(400)
      .json({ success: false, message: 'Query is required' });
  }

  try {
    const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
      params: {
        query,
        page: 1,
        num_pages: 20,
      },
      headers: {
        'X-RapidAPI-Key': '0d3678f4demsh0fdb835e7b93d0cp15bf60jsnd8ee05c7fc47',
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },
    });

    const jobs = response.data.data;

    let savedCount = 0;

    for (const job of jobs) {
      const existing = await Job.findOne({ jobId: job.job_id });
      const experience = extractExperience(job.job_description);
      // const qualifications = extractQualifications(job.job_description);

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
          experience: experience,
          qualification: qualifications,
          title: job.job_title,
          description: job.job_description,
          responsibilities,
          qualifications,
          jobTypes: job.job_employment_types,

          company: job.employer_name,
          applyMethod: {
            method: 'URL',
            url: job.job_apply_link,
          },
          jobTypes: job.job_employment_types,
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

        await newJob.save();
        savedCount++;
      } else {
        // If job exists, just update query list
        await Job.updateOne(
          { jobId: job.job_id },
          { $addToSet: { queries: query } },
        );
      }
    }

    res.status(200).json({
      success: true,
      message: `Jobs fetched and saved successfully`,
      savedCount,
      totalReceived: jobs.length,
      jobs: jobs,
    });
  } catch (err) {
    console.error('Error fetching/saving RapidAPI jobs:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getAllJobs = async (req, res) => {
  try {
    const {
      query = '',
      country = '',
      city = '',
      datePosted = '',
      employmentType = '',
      experience = '',
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    // General query search (searches title and description)
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { company: { $regex: query, $options: 'i' } },
      ];
    }

    // Location filters
    if (country) {
      filter.country = { $regex: country, $options: 'i' };
    }

    if (city) {
      filter['location.city'] = { $regex: city, $options: 'i' };
    }

    // Date posted filter
    if (datePosted) {
      const dateNow = new Date();
      let dateFilter;

      switch (datePosted) {
        case '1': // Last 24 hours
          dateFilter = new Date(dateNow.setDate(dateNow.getDate() - 1));
          break;
        case '3': // Last 3 days
          dateFilter = new Date(dateNow.setDate(dateNow.getDate() - 3));
          break;
        case '7': // Last week
          dateFilter = new Date(dateNow.setDate(dateNow.getDate() - 7));
          break;
        case '30': // Last month
          dateFilter = new Date(dateNow.setDate(dateNow.getDate() - 30));
          break;
        default:
          break;
      }

      if (dateFilter) {
        filter.createdAt = { $gte: dateFilter };
      }
    }

    // Employment type filter (can be multiple)
    if (employmentType) {
      const employmentTypes = employmentType.split(',');
      filter.jobTypes = { $in: employmentTypes };
    }

    // Experience level filter (can be multiple)
    if (experience) {
      filter.experience = { $gte: experience };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Job.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      jobs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching filtered jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export const getMannualyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ origin: 'HOSTED' }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getRapidJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ origin: 'EXTERNAL' });
    res.status(200).json({ success: true, jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getSingleJobDetail = async (req, res) => {
  const { jobId: _id } = req.params;
  try {
    const job = await Job.findById(_id).select('-queries');
    res.status(200).json({ success: true, job });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getJobDetailBySlug = async (req, res) => {
  const { slug } = req.query;

  try {
    const singleJob = await Job.findOne({ slug });
    res.status(200).json({
      singleJob,
    });
  } catch (error) {
    console.error('Error', error);
    res.status(500).json({
      message: 'Server Error',
      error: error.message,
    });
  }
};

export const getAllEmploymentTypes = async (req, res) => {
  try {
    const result = await Job.distinct('jobTypes');

    res.status(200).json({
      success: true,
      jobTypes: result,
    });
  } catch (error) {
    console.error('Error fetching employment types:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getAllExperiences = async (req, res) => {
  try {
    let experiences = await Job.distinct('experience');
    experiences = experiences.map((exp) => (exp === null ? 0 : exp));

    if (experiences.length === 0) {
      experiences = [0];
    }

    experiences.sort((a, b) => a - b);
    res.status(200).json({
      success: true,
      experiences,
    });
  } catch (error) {
    console.error('Error fetching experiences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const toggleJobStatus = async (req, res) => {
  const { jobId } = req.params;
  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    job.isActive = !job.isActive;
    await job.save();
    res.status(200).json({ message: 'Job status updated successfully' });
  } catch (error) {
    console.error('Error toggling job status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const jobViewsCount = async (req, res) => {
  const { jobId } = req.params;
  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    job.views++;
    await job.save();
    res.status(200).json({ message: 'Job views count updated successfully' });
  } catch (error) {
    console.error('Error updating job views count:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const jobApplications = async (req, res) => {
  const { jobId } = req.params;
  try {
    const job = await Job.findById(jobId).populate('applications');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(200).json({ job });
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSingleJobApplication = async (req, res) => {
  const { jobId } = req.params;
  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json({ job });
  } catch (error) {
    console.error('Error fetching job application:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
