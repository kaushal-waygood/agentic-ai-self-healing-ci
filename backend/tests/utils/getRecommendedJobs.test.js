import mongoose from 'mongoose';

jest.mock('../../src/models/students/student.model.js', () => ({
  Student: {
    findById: jest.fn(),
  },
}));

jest.mock('../../src/utils/jobHelpers.js', () => ({
  retrieveCandidates: jest.fn(),
  applyFilters: jest.fn(),
  rankJobsWithIntentBoost: jest.fn((jobs) => jobs),
  normalizeSet: jest.fn((arr = []) =>
    Array.from(
      new Set(
        arr
          .map((s) =>
            (typeof s === 'string' ? s.trim() : s?.skill || '').toLowerCase(),
          )
          .filter(Boolean),
      ),
    ),
  ),
  buildInteractionContext: jest.fn(),
}));

import { getRecommendedJobs } from '../../src/utils/getRecommendedJobs.js';
import {
  retrieveCandidates,
  applyFilters,
  buildInteractionContext,
} from '../../src/utils/jobHelpers.js';

describe('getRecommendedJobs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.DEBUG_JOBS;
    delete process.env.DEBUG_AUTOPILOT;
    buildInteractionContext.mockResolvedValue(null);
  });

  it('falls back to title-relaxed filtering for agent queries when strict title gating removes all candidates', async () => {
    const studentId = new mongoose.Types.ObjectId();
    const candidate = {
      _id: new mongoose.Types.ObjectId(),
      isActive: true,
      title: 'HR Manager',
      company: 'Acme',
      country: 'US',
      jobTypes: ['FULL_TIME'],
      remote: false,
    };

    retrieveCandidates.mockResolvedValue([candidate]);
    applyFilters
      .mockReturnValueOnce([])
      .mockReturnValueOnce([candidate]);

    const jobs = await getRecommendedJobs({
      studentId,
      studentProfile: {
        jobRole: 'Human Resources',
        jobPreferences: {},
        skills: [],
      },
      agentConfig: { country: 'US' },
      queryOverride: 'Human Resources',
      limit: 10,
      skipExternalFetch: true,
    });

    expect(applyFilters).toHaveBeenCalledTimes(2);
    expect(applyFilters).toHaveBeenNthCalledWith(
      1,
      [candidate],
      expect.objectContaining({ queryOverride: 'Human Resources' }),
    );
    expect(applyFilters).toHaveBeenNthCalledWith(
      2,
      [candidate],
      expect.objectContaining({ queryOverride: null }),
    );
    expect(jobs).toEqual([candidate]);
  });

  it('retries with a profile-derived query when the raw queryOverride returns no jobs', async () => {
    const studentId = new mongoose.Types.ObjectId();
    const candidate = {
      _id: new mongoose.Types.ObjectId(),
      isActive: true,
      title: 'Backend Developer',
      company: 'Acme',
      country: 'AE',
      jobTypes: ['FULL_TIME'],
      remote: true,
    };

    retrieveCandidates
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([candidate]);
    applyFilters.mockReturnValueOnce([]).mockReturnValueOnce([candidate]);

    const jobs = await getRecommendedJobs({
      studentId,
      studentProfile: {
        jobRole: 'Software Developer',
        jobPreferences: { preferredJobTitles: ['Backend Developer'] },
        skills: [{ skill: 'Node.js' }],
      },
      agentConfig: {
        jobTitle: 'sd',
        country: 'AE',
      },
      queryOverride: 'sd',
      limit: 10,
      skipExternalFetch: true,
    });

    expect(retrieveCandidates).toHaveBeenCalledTimes(3);
    expect(retrieveCandidates).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ queryOverride: 'sd' }),
      expect.any(Number),
    );
    expect(retrieveCandidates).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ queryOverride: 'sd' }),
      expect.any(Number),
    );
    expect(retrieveCandidates).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({ queryOverride: null }),
      expect.any(Number),
    );
    expect(jobs).toEqual([candidate]);
  });
});
