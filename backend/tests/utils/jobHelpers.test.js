import {
  applyFilters,
  rankJobsWithIntentBoost,
} from '../../src/utils/jobHelpers.js';

describe('Job Filters Utility', () => {
  const baseContext = {
    filters: { country: 'IN' },
    interactions: { applied: new Set(), saved: new Set(), views: {} },
  };

  const getJobMock = (overrides) => ({
    _id: Math.random().toString(),
    isActive: true,
    country: 'IN',
    location: { city: 'Bengaluru', state: 'Karnataka' },
    description: 'Looking for a dev in India',
    ...overrides,
  });

  describe('applyFilters', () => {
    it('should drop jobs that the user has already applied for', () => {
      const job1 = getJobMock({ _id: '123' });
      const job2 = getJobMock({ _id: '456' });

      const context = {
        ...baseContext,
        interactions: {
          applied: new Set(['123']),
          saved: new Set(),
          views: {},
        },
      };

      const result = applyFilters([job1, job2], context);
      expect(result.length).toBe(1);
      expect(result[0]._id).toBe('456');
    });

    it('should properly filter by part-time employment types with hyphen', () => {
      const jobs = [
        getJobMock({ jobTypes: ['PART_TIME'] }),
        getJobMock({ jobTypes: ['PARTTIME'] }),
        getJobMock({ jobTypes: ['FULL_TIME'] }),
      ];

      const context = {
        ...baseContext,
        filters: { country: 'IN', employmentType: 'Part-time' },
      };

      const result = applyFilters(jobs, context);
      expect(result.length).toBe(2);
      expect(result.map((j) => j.jobTypes[0]).sort()).toEqual([
        'PARTTIME',
        'PART_TIME',
      ]);
    });

    it('should properly filter by internship employment types regardless of casing', () => {
      const jobs = [
        getJobMock({ jobTypes: ['INTERNSHIP'] }),
        getJobMock({ jobTypes: ['INTERN'] }),
        getJobMock({ jobTypes: ['FULL_TIME'] }),
      ];

      const context = {
        ...baseContext,
        filters: { country: 'IN', employmentType: 'intern' },
      };

      const result = applyFilters(jobs, context);
      expect(result.length).toBe(2);
      expect(result.map((j) => j.jobTypes[0]).sort()).toEqual([
        'INTERN',
        'INTERNSHIP',
      ]);
    });

    it('should properly link freelance, contract, and contractor employment types together', () => {
      const jobs = [
        getJobMock({ jobTypes: ['FREELANCE'] }),
        getJobMock({ jobTypes: ['CONTRACTOR'] }),
        getJobMock({ jobTypes: ['CONTRACT'] }),
        getJobMock({ jobTypes: ['FULL_TIME'] }),
      ];

      const context = {
        ...baseContext,
        filters: { country: 'IN', employmentType: 'freelance' },
      };

      const result = applyFilters(jobs, context);
      expect(result.length).toBe(3);
    });

    it('should not drop external rapidapi jobs simply because they are missing the ISO country abbreviation when they belong to target country', () => {
      const jobNoCode = getJobMock({
        country: null,
        location: { city: 'Bengaluru', state: 'Karnataka' },
        description: 'Building the best platform inside india...',
      });
      const context = {
        ...baseContext,
        filters: { country: 'IN' },
      };

      const result = applyFilters([jobNoCode], context);
      expect(result.length).toBe(1);
    });

    it('should filter jobs by selected experience ranges', () => {
      const jobs = [
        getJobMock({
          _id: 'exp-1',
          experience: ['6 months'],
          description: 'Ideal for candidates with 6 months of experience',
        }),
        getJobMock({
          _id: 'exp-2',
          experience: ['2 years'],
          description: 'Requires 2 years of experience',
        }),
        getJobMock({
          _id: 'exp-3',
          experience: ['6 years'],
          description: 'Requires 6 years of experience',
        }),
      ];

      const context = {
        ...baseContext,
        filters: { country: 'IN', experience: '1 – 3 Years' },
      };

      const result = applyFilters(jobs, context);
      expect(result).toHaveLength(1);
      expect(result[0]._id).toBe('exp-2');
    });

    it('should match fresher filters against descriptive job text', () => {
      const jobs = [
        getJobMock({
          _id: 'fresh-1',
          title: 'Graduate Engineer Trainee',
          experience: [],
          description: 'Fresher candidates are encouraged to apply.',
        }),
        getJobMock({
          _id: 'fresh-2',
          title: 'Senior Backend Developer',
          experience: ['5+ years'],
          description: 'Requires at least 5 years of experience',
        }),
      ];

      const context = {
        ...baseContext,
        filters: { country: 'IN', experience: 'Fresher' },
      };

      const result = applyFilters(jobs, context);
      expect(result).toHaveLength(1);
      expect(result[0]._id).toBe('fresh-1');
    });
  });

  describe('rankJobsWithIntentBoost', () => {
    it('should produce numeric rank scores even when jobPostedAt is invalid', () => {
      const ranked = rankJobsWithIntentBoost(
        [
          getJobMock({
            title: 'Backend Developer',
            jobPostedAt: 'not-a-date',
            remote: true,
          }),
        ],
        {
          filters: {},
          profile: { titles: ['Backend Developer'] },
        },
      );

      expect(ranked).toHaveLength(1);
      expect(Number.isNaN(ranked[0].rankScore)).toBe(false);
      expect(Number.isFinite(ranked[0].rankScore)).toBe(true);
    });
  });
});
