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
    updateOne: jest.fn(),
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

jest.mock('../../src/models/AgentFoundJob.js', () => ({
  AgentFoundJob: {
    find: jest.fn(),
    create: jest.fn(),
    countDocuments: jest.fn(),
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

jest.mock('../../src/utils/credits.js', () => ({
  getAutopilotEntitlements: jest.fn().mockResolvedValue({
    planType: 'Free',
    billingPeriod: null,
    dailyJobLimit: 5,
    maxAgents: 1,
    isFree: true,
  }),
}));

import { StudentAgent } from '../../src/models/students/studentAgent.model.js';
import { getStudentProfileSnapshot } from '../../src/services/getStudentProfileSnapshot.js';
import { User } from '../../src/models/User.model.js';
import { StudentApplication } from '../../src/models/students/studentApplication.model.js';
import { AppliedJob } from '../../src/models/AppliedJob.js';
import { AgentFoundJob } from '../../src/models/AgentFoundJob.js';
import { getRecommendedJobs } from '../../src/utils/getRecommendedJobs.js';

describe('Autopilot Worker', () => {
  const studentId = new mongoose.Types.ObjectId();
  const agentId = new mongoose.Types.ObjectId();
  const jobId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AUTOGEN_TAILORED = 'true';
    process.env.DEBUG_AUTOPILOT = '0';
    StudentApplication.create.mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
    });
    AgentFoundJob.create.mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
    });
  });

  afterEach(() => {
    delete process.env.AUTOGEN_TAILORED;
    delete process.env.DEBUG_AUTOPILOT;
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
      expect(result).toEqual({
        processed: 0,
        agentsChecked: 0,
        alreadySearchedToday: 0,
        poolAlreadyFull: 0,
        planAgentCapReached: 0,
        autopilotDisabled: 0,
        missingProfile: 0,
        noJobsFound: 0,
      });
      expect(getStudentProfileSnapshot).not.toHaveBeenCalled();
    });

    it('skips student when profile not found', async () => {
      const agent = {
        _id: agentId,
        student: studentId,
        agentName: 'Test Agent',
        jobTitle: 'Engineer',
        agentDailyLimit: 5,
      };
      StudentAgent.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([agent]),
        }),
      });
      getStudentProfileSnapshot.mockResolvedValue(null);

      const result = await findAndProcessJobs();
      expect(result.processed).toBe(0);
      expect(result.missingProfile).toBe(1);
      expect(getRecommendedJobs).not.toHaveBeenCalled();
    });

    it('skips student when autopilot disabled in settings', async () => {
      const agent = {
        _id: agentId,
        student: studentId,
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

      const result = await findAndProcessJobs();
      expect(result.processed).toBe(0);
      expect(result.autopilotDisabled).toBe(1);
      expect(getRecommendedJobs).not.toHaveBeenCalled();
    });

    it('skips agent when limit reached', async () => {
      const agentDailyLimit = 5;
      const agent = {
        _id: agentId,
        student: studentId,
        agentName: 'Test Agent',
        jobTitle: 'Engineer',
        agentDailyLimit,
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
      
      AgentFoundJob.countDocuments.mockResolvedValue(agentDailyLimit);

      const result = await findAndProcessJobs();
      expect(result.processed).toBe(0);
      expect(result.poolAlreadyFull).toBe(1);
      expect(getRecommendedJobs).not.toHaveBeenCalled();
    });

    it('retries agent on the same day when it is still below the limit', async () => {
      const agent = {
        _id: agentId,
        student: studentId,
        agentName: 'Test Agent',
        jobTitle: 'Engineer',
        agentDailyLimit: 5,
        lastDiscoveryRunAt: new Date(),
        lastDiscoveryActiveCount: 0,
        lastDiscoveryTargetLimit: 5,
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
      AgentFoundJob.countDocuments.mockResolvedValueOnce(0);
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
      AgentFoundJob.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      });
      getRecommendedJobs.mockResolvedValueOnce([
        { _id: new mongoose.Types.ObjectId(), title: 'Same Day Retry Job' },
      ]);

      const result = await findAndProcessJobs();
      expect(result.processed).toBe(1);
      expect(result.alreadySearchedToday).toBe(0);
      expect(AgentFoundJob.countDocuments).toHaveBeenCalledTimes(1);
      expect(getRecommendedJobs).toHaveBeenCalled();
    });

    it('allows same-day refill when plan cap increased above the last run target', async () => {
      const agent = {
        _id: agentId,
        student: studentId,
        agentName: 'Test Agent',
        jobTitle: 'Engineer',
        agentDailyLimit: 5,
        lastDiscoveryRunAt: new Date(),
        lastDiscoveryActiveCount: 5,
        lastDiscoveryTargetLimit: 5,
      };
      StudentAgent.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([agent]),
        }),
      });
      getStudentProfileSnapshot.mockResolvedValue({
        settings: { autopilotEnabled: true, autopilotLimit: 12 },
        jobPreferences: {},
      });
      AgentFoundJob.countDocuments.mockResolvedValue(5);
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
      AgentFoundJob.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      });
      getRecommendedJobs.mockResolvedValue([
        { _id: new mongoose.Types.ObjectId(), title: 'Job 1' },
      ]);

      const { getAutopilotEntitlements } = await import(
        '../../src/utils/credits.js'
      );
      getAutopilotEntitlements.mockResolvedValueOnce({
        planType: 'Monthly',
        billingPeriod: 'Monthly',
        dailyJobLimit: 12,
        maxAgents: Infinity,
        isFree: false,
      });

      const result = await findAndProcessJobs();

      expect(getRecommendedJobs).toHaveBeenCalled();
      expect(result.processed).toBe(1);
      expect(result.alreadySearchedToday).toBe(0);
      expect(StudentAgent.updateOne).toHaveBeenCalledWith(
        { _id: agentId },
        {
          $set: {
            lastDiscoveryRunAt: expect.any(Date),
            lastDiscoveryActiveCount: 6,
            lastDiscoveryTargetLimit: 12,
          },
        },
      );
    });

    it('allows same-day refill when active jobs dropped below the last run pool size', async () => {
      const agent = {
        _id: agentId,
        student: studentId,
        agentName: 'Test Agent',
        jobTitle: 'Engineer',
        agentDailyLimit: 5,
        lastDiscoveryRunAt: new Date(),
        lastDiscoveryActiveCount: 5,
        lastDiscoveryTargetLimit: 5,
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
      AgentFoundJob.countDocuments.mockResolvedValue(4);
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
      AgentFoundJob.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      });
      getRecommendedJobs.mockResolvedValue([
        { _id: new mongoose.Types.ObjectId(), title: 'Replacement Job' },
      ]);

      const result = await findAndProcessJobs();

      expect(getRecommendedJobs).toHaveBeenCalled();
      expect(result.processed).toBe(1);
      expect(result.alreadySearchedToday).toBe(0);
      expect(StudentAgent.updateOne).toHaveBeenCalledWith(
        { _id: agentId },
        {
          $set: {
            lastDiscoveryRunAt: expect.any(Date),
            lastDiscoveryActiveCount: 5,
            lastDiscoveryTargetLimit: 5,
          },
        },
      );
    });

    it('keeps broadening discovery until the target pool is filled', async () => {
      const agent = {
        _id: agentId,
        student: studentId,
        agentName: 'Test Agent',
        jobTitle: 'MERN Developer',
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
      AgentFoundJob.countDocuments.mockResolvedValue(0);
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
      AgentFoundJob.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      });
      getRecommendedJobs
        .mockResolvedValueOnce([
          { _id: new mongoose.Types.ObjectId(), title: 'Local Job 1' },
          { _id: new mongoose.Types.ObjectId(), title: 'Local Job 2' },
        ])
        .mockResolvedValueOnce([
          { _id: new mongoose.Types.ObjectId(), title: 'External Job 3' },
          { _id: new mongoose.Types.ObjectId(), title: 'External Job 4' },
        ])
        .mockResolvedValueOnce([
          { _id: new mongoose.Types.ObjectId(), title: 'External Job 5' },
        ]);

      const result = await findAndProcessJobs();

      expect(getRecommendedJobs).toHaveBeenCalledTimes(3);
      expect(AgentFoundJob.create).toHaveBeenCalledTimes(5);
      expect(result.processed).toBe(5);
      expect(StudentAgent.updateOne).toHaveBeenCalledWith(
        { _id: agentId },
        {
          $set: {
            lastDiscoveryRunAt: expect.any(Date),
            lastDiscoveryActiveCount: 5,
            lastDiscoveryTargetLimit: 5,
          },
        },
      );
    });

    it('fetches recommended jobs and stores them', async () => {
      const agent = {
        _id: agentId,
        student: studentId,
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

      AgentFoundJob.countDocuments.mockResolvedValue(0);

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
      AgentFoundJob.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      });
      
      getRecommendedJobs.mockResolvedValue([
        { _id: new mongoose.Types.ObjectId(), title: 'Job 1' },
      ]);

      const result = await findAndProcessJobs();

      expect(getRecommendedJobs).toHaveBeenCalled();
      expect(AgentFoundJob.create).toHaveBeenCalledTimes(1);
      expect(StudentAgent.updateOne).toHaveBeenCalledWith(
        { _id: agentId },
        {
          $set: {
            lastDiscoveryRunAt: expect.any(Date),
            lastDiscoveryActiveCount: 1,
            lastDiscoveryTargetLimit: 5,
          },
        },
      );
      expect(result.processed).toBe(1);
      expect(result.noJobsFound).toBe(0);
    });

    it('excludes applied and pending jobs from recommendations', async () => {
      const agent = {
        _id: agentId,
        student: studentId,
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

      AgentFoundJob.countDocuments.mockResolvedValue(0);

      const existingJobId = new mongoose.Types.ObjectId();

      AppliedJob.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([{ job: existingJobId }]),
        }),
      });
      StudentApplication.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      });
      AgentFoundJob.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      });
      
      getRecommendedJobs.mockResolvedValue([]);
      
      const result = await findAndProcessJobs();

      expect(getRecommendedJobs).toHaveBeenCalledWith(
        expect.objectContaining({
          appliedJobIds: expect.arrayContaining([String(existingJobId)])
        }),
      );
      expect(StudentAgent.updateOne).toHaveBeenCalledWith(
        { _id: agentId },
        {
          $set: {
            lastDiscoveryRunAt: expect.any(Date),
            lastDiscoveryActiveCount: 0,
            lastDiscoveryTargetLimit: 5,
          },
        },
      );
      expect(result.noJobsFound).toBe(1);
    });
  });
});
