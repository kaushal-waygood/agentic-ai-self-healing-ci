/**
 * Autopilot Worker Test Suite
 * Tests the findAndProcessJobs logic and helper functions.
 */
import mongoose from 'mongoose';
import {
  toBool,
  clamp,
  toInt,
  normalizeLimit,
  buildApplicationData,
  runWithConcurrency,
  findAndProcessJobs,
} from '../../src/worker/autopilotWorker.js';

// Mock dependencies
jest.mock('../../src/models/students/studentAgent.model.js', () => ({
  StudentAgent: {
    find: jest.fn(),
  },
}));

jest.mock('../../src/services/getStudentProfileSnapshot.js', () => ({
  getStudentProfileSnapshot: jest.fn(),
}));

jest.mock('../../src/models/User.model.js', () => ({
  User: {
    findById: jest.fn(),
    updateOne: jest.fn(),
  },
}));

jest.mock('../../src/models/students/studentApplication.model.js', () => ({
  StudentApplication: {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../../src/models/AppliedJob.js', () => ({
  AppliedJob: {
    find: jest.fn(),
    exists: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../../src/utils/getRecommendedJobs.js', () => ({
  getRecommendedJobs: jest.fn(),
}));

jest.mock('../../src/utils/profileHydration.js', () => ({
  buildEffectiveStudentProfile: jest.fn((student, agent) => ({
    ...student,
    jobRole: agent?.jobTitle || student?.jobRole,
    jobPreferences: student?.jobPreferences || {},
  })),
}));

jest.mock('../../src/utils/tailored.autopilot.js', () => ({
  processTailoredApplication: jest.fn().mockResolvedValue(true),
}));

import { StudentAgent } from '../../src/models/students/studentAgent.model.js';
import { getStudentProfileSnapshot } from '../../src/services/getStudentProfileSnapshot.js';
import { User } from '../../src/models/User.model.js';
import { StudentApplication } from '../../src/models/students/studentApplication.model.js';
import { AppliedJob } from '../../src/models/AppliedJob.js';
import { getRecommendedJobs } from '../../src/utils/getRecommendedJobs.js';
import { processTailoredApplication } from '../../src/utils/tailored.autopilot.js';

describe('Autopilot Worker', () => {
  const studentId = new mongoose.Types.ObjectId();
  const agentId = 'agent_test_123';
  const jobId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AUTOGEN_TAILORED = 'true';
  });

  afterEach(() => {
    delete process.env.AUTOGEN_TAILORED;
  });

  // ─────────────────────────────────────────────────────────────
  // Helper functions
  // ─────────────────────────────────────────────────────────────
  describe('toBool', () => {
    it('returns true for boolean true', () => {
      expect(toBool(true)).toBe(true);
    });
    it('returns false for boolean false', () => {
      expect(toBool(false)).toBe(false);
    });
    it('returns true for string "true"', () => {
      expect(toBool('true')).toBe(true);
    });
    it('returns true for string "TRUE"', () => {
      expect(toBool('TRUE')).toBe(true);
    });
    it('returns false for string "false"', () => {
      expect(toBool('false')).toBe(false);
    });
    it('returns false for null/undefined', () => {
      expect(toBool(null)).toBe(false);
      expect(toBool(undefined)).toBe(false);
    });
  });

  describe('clamp', () => {
    it('clamps value within min and max', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-1, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('toInt', () => {
    it('parses valid integers', () => {
      expect(toInt('42', 0)).toBe(42);
      expect(toInt(7, 0)).toBe(7);
    });
    it('returns fallback for invalid input', () => {
      expect(toInt('abc', 5)).toBe(5);
      expect(toInt(NaN, 10)).toBe(10);
      expect(toInt(null, 3)).toBe(3);
    });
  });

  describe('normalizeLimit', () => {
    it('clamps value within min and max', () => {
      expect(normalizeLimit(5, 10, { min: 0, max: 20 })).toBe(5);
      expect(normalizeLimit(-5, 10, { min: 0, max: 20 })).toBe(0);
      expect(normalizeLimit(100, 10, { min: 0, max: 20 })).toBe(20);
    });
    it('uses fallback for invalid input', () => {
      expect(normalizeLimit('x', 5, { min: 0, max: 10 })).toBe(5);
    });
  });

  describe('buildApplicationData', () => {
    it('builds valid application data structure', () => {
      const job = {
        title: 'Dev',
        company: 'Acme',
        description: 'Desc',
        country: 'US',
        location: { city: 'NYC', state: 'NY' },
        jobTypes: ['FULL_TIME'],
      };
      const student = { fullName: 'Test', skills: [] };
      const result = buildApplicationData(job, student, '');
      expect(result.job.title).toBe('Dev');
      expect(result.job.company).toBe('Acme');
      expect(result.candidate).toContain('Test');
    });
  });

  describe('runWithConcurrency', () => {
    it('processes all items with concurrency limit', async () => {
      const processed = [];
      await runWithConcurrency(
        [1, 2, 3],
        async (n) => {
          processed.push(n);
        },
        2,
      );
      expect(processed.sort()).toEqual([1, 2, 3]);
    });
    it('handles empty array', async () => {
      const processed = [];
      await runWithConcurrency([], async (n) => processed.push(n), 3);
      expect(processed).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // findAndProcessJobs
  // ─────────────────────────────────────────────────────────────
  describe('findAndProcessJobs', () => {
    it('returns early when no active agents', async () => {
      StudentAgent.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await findAndProcessJobs();
      expect(result).toEqual({ processed: 0, reason: 'no_active_agents' });
      expect(getStudentProfileSnapshot).not.toHaveBeenCalled();
    });

    it('skips student when profile not found', async () => {
      const agent = {
        student: studentId,
        agentId,
        agentName: 'Test Agent',
        jobTitle: 'Engineer',
        agentDailyLimit: 5,
      };
      StudentAgent.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([agent]),
        }),
      });
      User.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({
            usageLimits: { aiAutoApplyDailyLimit: 10 },
            usageCounters: { aiAutoApplyDailyLimit: 0 },
          }),
        }),
      });
      getStudentProfileSnapshot.mockResolvedValue(null);

      const result = await findAndProcessJobs();
      expect(result.processed).toBe(0);
      expect(getRecommendedJobs).not.toHaveBeenCalled();
    });

    it('skips student when autopilot disabled in settings', async () => {
      const agent = {
        student: studentId,
        agentId,
        agentName: 'Test Agent',
        jobTitle: 'Engineer',
        agentDailyLimit: 5,
      };
      StudentAgent.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([agent]),
        }),
      });
      getStudentProfileSnapshot.mockResolvedValue({
        settings: { autopilotEnabled: false },
        jobPreferences: {},
      });
      User.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({
            usageLimits: { aiAutoApplyDailyLimit: 10 },
            usageCounters: { aiAutoApplyDailyLimit: 0 },
          }),
        }),
      });

      const result = await findAndProcessJobs();
      expect(result.processed).toBe(0);
      expect(getRecommendedJobs).not.toHaveBeenCalled();
    });

    it('skips student when plan limit reached', async () => {
      const agent = {
        student: studentId,
        agentId,
        agentName: 'Test Agent',
        jobTitle: 'Engineer',
        agentDailyLimit: 5,
      };
      StudentAgent.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([agent]),
        }),
      });
      getStudentProfileSnapshot.mockResolvedValue({
        settings: { autopilotEnabled: true, autopilotLimit: 5 },
        jobPreferences: {},
      });
      User.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({
            usageLimits: { aiAutoApplyDailyLimit: 0 },
            usageCounters: { aiAutoApplyDailyLimit: 0 },
          }),
        }),
      });

      const result = await findAndProcessJobs();
      expect(result.processed).toBe(0);
      expect(getRecommendedJobs).not.toHaveBeenCalled();
    });

    it('excludes applied and pending jobs from recommendations', async () => {
      const agent = {
        student: studentId,
        agentId,
        agentName: 'Test Agent',
        jobTitle: 'Engineer',
        agentDailyLimit: 5,
      };
      StudentAgent.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([agent]),
        }),
      });
      getStudentProfileSnapshot.mockResolvedValue({
        settings: { autopilotEnabled: true, autopilotLimit: 10 },
        jobPreferences: {},
      });
      User.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({
            usageLimits: { aiAutoApplyDailyLimit: 10 },
            usageCounters: { aiAutoApplyDailyLimit: 0 },
          }),
        }),
      });
      AppliedJob.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([{ job: jobId }]),
        }),
      });
      StudentApplication.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      });
      getRecommendedJobs.mockResolvedValue([]);

      await findAndProcessJobs();

      expect(getRecommendedJobs).toHaveBeenCalledWith(
        expect.objectContaining({
          studentId,
          appliedJobIds: expect.arrayContaining([
            expect.any(mongoose.Types.ObjectId),
          ]),
          limit: expect.any(Number),
        }),
      );
    });

    it('skips job when already in AppliedJob (idempotency)', async () => {
      const agent = {
        student: studentId,
        agentId,
        agentName: 'Test Agent',
        jobTitle: 'Engineer',
        agentDailyLimit: 5,
      };
      const mockJob = {
        _id: jobId,
        title: 'Software Engineer',
        company: 'Acme',
        description: 'Desc',
      };
      StudentAgent.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([agent]),
        }),
      });
      getStudentProfileSnapshot.mockResolvedValue({
        settings: { autopilotEnabled: true, autopilotLimit: 10 },
        jobPreferences: {},
      });
      User.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({
            usageLimits: { aiAutoApplyDailyLimit: 10 },
            usageCounters: { aiAutoApplyDailyLimit: 0 },
          }),
        }),
      });
      AppliedJob.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      });
      StudentApplication.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      });
      getRecommendedJobs.mockResolvedValue([mockJob]);
      AppliedJob.exists.mockResolvedValue(true); // Already applied

      const result = await findAndProcessJobs();

      expect(result.processed).toBe(0);
      expect(StudentApplication.create).not.toHaveBeenCalled();
      expect(AppliedJob.create).not.toHaveBeenCalled();
    });

    it('skips job when already in StudentApplication (idempotency)', async () => {
      const agent = {
        student: studentId,
        agentId,
        agentName: 'Test Agent',
        jobTitle: 'Engineer',
        agentDailyLimit: 5,
      };
      const mockJob = {
        _id: jobId,
        title: 'Software Engineer',
        company: 'Acme',
        description: 'Desc',
      };
      StudentAgent.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([agent]),
        }),
      });
      getStudentProfileSnapshot.mockResolvedValue({
        settings: { autopilotEnabled: true, autopilotLimit: 10 },
        jobPreferences: {},
      });
      User.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({
            usageLimits: { aiAutoApplyDailyLimit: 10 },
            usageCounters: { aiAutoApplyDailyLimit: 0 },
          }),
        }),
      });
      AppliedJob.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([]),
          }),
        }),
      });
      AppliedJob.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      });
      StudentApplication.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      });
      getRecommendedJobs.mockResolvedValue([mockJob]);
      AppliedJob.exists.mockResolvedValue(false);
      StudentApplication.findOne.mockResolvedValue({ _id: 'existing' }); // Already in progress

      const result = await findAndProcessJobs();

      expect(result.processed).toBe(0);
      expect(StudentApplication.create).not.toHaveBeenCalled();
      expect(AppliedJob.create).not.toHaveBeenCalled();
    });

    it('does not process when AUTOGEN_TAILORED is false', async () => {
      process.env.AUTOGEN_TAILORED = 'false';
      const agent = {
        student: studentId,
        agentId,
        agentName: 'Test Agent',
        jobTitle: 'Engineer',
        agentDailyLimit: 5,
      };
      StudentAgent.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([agent]),
        }),
      });
      getStudentProfileSnapshot.mockResolvedValue({
        settings: { autopilotEnabled: true, autopilotLimit: 10 },
        jobPreferences: {},
      });
      User.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({
            usageLimits: { aiAutoApplyDailyLimit: 10 },
            usageCounters: { aiAutoApplyDailyLimit: 0 },
          }),
        }),
      });
      AppliedJob.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      });
      StudentApplication.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      });
      getRecommendedJobs.mockResolvedValue([
        { _id: jobId, title: 'Dev', company: 'Acme', description: 'D' },
      ]);

      const result = await findAndProcessJobs();

      expect(result.processed).toBe(0);
      expect(processTailoredApplication).not.toHaveBeenCalled();
    });
  });
});
