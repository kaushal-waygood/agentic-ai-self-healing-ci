import { rapidApiKeyManager } from '@/lib/api-keys/rapid-api-key-manager';
import { JobListing } from '@/lib/data/jobs';
import type { JobSearchFlowInput } from '@/lib/schemas/job-search-schema';
import { EstimateSalaryOutput } from '@/ai/flows/estimate-salary-flow';

const JSEARCH_API_BASE_URL = 'https://jsearch.p.rapidapi.com';

/**
 * Custom error class for JSearch API specific failures.
 */
export class JSearchApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JSearchApiError';
  }
}

// This service is now responsible for direct communication with the JSearch API.
export class JSearchApiService {
  private static instance: JSearchApiService;

  private constructor() {}

  public static async getInstance(): Promise<JSearchApiService> {
    if (!JSearchApiService.instance) {
      JSearchApiService.instance = new JSearchApiService();
    }
    return JSearchApiService.instance;
  }

  private async makeRequest(
    endpoint: string,
    params: URLSearchParams,
    attempt = 1,
  ): Promise<any> {
    const keyManager = await rapidApiKeyManager;
    const totalKeys = keyManager.getTotalKeys();

    if (totalKeys === 0) {
      const errorMsg = '[JSearchService] No RapidAPI keys are configured.';
      console.error(errorMsg);
      throw new JSearchApiError(errorMsg);
    }

    const apiKey = keyManager.getNextKey();

    if (!apiKey) {
      const errorMsg = '[JSearchService] Could not retrieve an API key.';
      console.error(errorMsg);
      throw new JSearchApiError(errorMsg);
    }

    const url = `${JSEARCH_API_BASE_URL}/${endpoint}?${params.toString()}`;
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },
      cache: 'no-store' as const,
    };

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorBody = await response.text();
        // Retry on auth errors, rate limits, or server errors
        if (
          (response.status === 401 ||
            response.status === 429 ||
            response.status >= 500) &&
          attempt < totalKeys
        ) {
          console.warn(
            `JSearch API Error (${
              response.status
            }), retrying with next key. Attempt ${attempt + 1}/${totalKeys}`,
          );
          return this.makeRequest(endpoint, params, attempt + 1);
        }
        // Final attempt failed, throw a custom error
        const errorMessage = `JSearch API request failed after all retries. Status: ${response.status}, Endpoint: ${endpoint}, Body: ${errorBody}`;
        console.error(`[JSearchService] ${errorMessage}`);
        throw new JSearchApiError(
          'The job search service is currently unavailable.',
        );
      }

      const data = await response.json();
      if (data.status !== 'OK') {
        // JSearch API can return status "OK" but an empty data array for "not found", which is not an error.
        // We only throw if the status is explicitly not 'OK'.
        const errorMsg = `JSearch API returned status '${data.status}' for endpoint ${endpoint}.`;
        console.error(`[JSearchService] ${errorMsg}`, data);
        throw new JSearchApiError(errorMsg);
      }

      return data;
    } catch (error: any) {
      // Re-throw our custom error to be handled by the caller
      if (error instanceof JSearchApiError) {
        throw error;
      }

      console.error(
        `[JSearchService] Network or other error during fetch to ${endpoint}:`,
        error,
      );
      if (attempt < totalKeys) {
        return this.makeRequest(endpoint, params, attempt + 1);
      }
      // Final attempt failed
      const finalErrorMessage = `JSearch API is currently unavailable due to a network error.`;
      console.error(
        `[JSearchService] Fetch request failed after all retries for endpoint ${endpoint}.`,
      );
      throw new JSearchApiError(finalErrorMessage);
    }
  }

  public async searchJobs(filters: JobSearchFlowInput): Promise<JobListing[]> {
    const params = new URLSearchParams({
      query: filters.query,
      page: (filters.page || 1).toString(),
      num_pages: '1',
    });

    if (filters.country) params.append('country', filters.country);
    if (filters.datePosted && filters.datePosted !== 'all')
      params.append('date_posted', filters.datePosted);
    if (filters.workFromHome) params.append('remote_jobs_only', 'true');
    if (filters.employmentTypes?.length)
      params.append('employment_types', filters.employmentTypes.join(','));
    if (filters.jobRequirements?.length)
      params.append('job_requirements', filters.jobRequirements.join(','));
    if (filters.radius) params.append('radius', filters.radius.toString());

    const responseData = await this.makeRequest('search', params);

    if (!responseData || !responseData.data) {
      return []; // Return empty array if the request succeeded but had no data
    }

    const apiData = responseData.data;
    return apiData.map(
      (job: any): JobListing => ({
        id: job.job_id,
        title: job.job_title,
        company: job.employer_name,
        location:
          job.job_city && job.job_state && job.job_country
            ? `${job.job_city}, ${job.job_state}, ${job.job_country}`
            : 'Not specified',
        type: job.job_employment_type,
        postedDate: job.job_posted_at_datetime_utc
          ? new Date(job.job_posted_at_datetime_utc).toLocaleDateString()
          : 'N/A',
        description: job.job_description,
        status: 'published', // All jobs from JSearch are considered published
        salary:
          job.job_salary_period && job.job_salary_currency
            ? `${job.job_min_salary}-${job.job_max_salary} ${job.job_salary_currency} ${job.job_salary_period}`
            : null,
        companyLogo: job.employer_logo,
        activelyHiring: job.job_is_remote,
        earlyApplicant: false,
        jobUrl: job.job_apply_link,
        publisher: job.job_publisher,
        countryCode: job.job_country,
        highlights: job.job_highlights,
      }),
    );
  }

  public async getJobDetails(jobId: string): Promise<JobListing | null> {
    const params = new URLSearchParams({
      job_id: jobId,
    });
    const responseData = await this.makeRequest('job-details', params);

    if (!responseData || !responseData.data || responseData.data.length === 0) {
      return null;
    }

    const apiDataArray = responseData.data;
    const job = apiDataArray[0];
    return {
      id: job.job_id,
      title: job.job_title,
      company: job.employer_name,
      location:
        job.job_city && job.job_state && job.job_country
          ? `${job.job_city}, ${job.job_state}, ${job.job_country}`
          : 'Not specified',
      type: job.job_employment_type,
      postedDate: job.job_posted_at_datetime_utc
        ? new Date(job.job_posted_at_datetime_utc).toLocaleDateString()
        : 'N/A',
      description: job.job_description,
      status: 'published',
      salary:
        job.job_salary_period && job.job_salary_currency
          ? `${job.job_min_salary}-${job.job_max_salary} ${job.job_salary_currency} ${job.job_salary_period}`
          : null,
      companyLogo: job.employer_logo,
      activelyHiring: job.job_is_remote,
      earlyApplicant: false,
      jobUrl: job.job_apply_link,
      publisher: job.job_publisher,
      countryCode: job.job_country,
      highlights: job.job_highlights,
    };
  }

  public async estimateSalary(
    jobTitle: string,
    location: string,
    experience: string,
  ): Promise<EstimateSalaryOutput | null> {
    const params = new URLSearchParams({
      job_title: jobTitle,
      location: location,
      location_type: 'ANY',
      years_of_experience: experience,
    });
    const responseData = await this.makeRequest('estimated-salary', params);

    const salaryData = responseData?.data;

    // If the API returns no data, or the data is an empty object or is missing the salary, return null instead of throwing.
    if (
      !salaryData ||
      salaryData.min_salary === undefined ||
      salaryData.min_salary === null
    ) {
      return null;
    }

    return {
      minSalary: salaryData.min_salary,
      maxSalary: salaryData.max_salary,
      medianSalary: salaryData.median_salary,
      publisherName: salaryData.publisher_name,
      publisherLink: salaryData.publisher_link,
    };
  }
}
