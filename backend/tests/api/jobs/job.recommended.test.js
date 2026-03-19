/**
 * ============================================================
 *  RECOMMENDED JOBS API — Comprehensive Test Suite
 *  Endpoint: GET /api/v1/students/jobs/recommended
 *  Auth:     Bearer token required (Student role)
 * ============================================================
 *
 *  Coverage:
 *   ✅ Positive scenarios (happy path, paginated response)
 *   ❌ Negative / auth scenarios (missing / invalid token)
 *   📄 Pagination (page, limit, hasNextPage, cross-page dedup)
 *   🔄 Fallback (external API kick-in for sparse profiles)
 *   🚫 Input coercion / bad params — must not 500
 *   ⚡ Response-time guard
 *   🧹 Profile-completeness edge cases (empty profile user)
 *
 *  🐛 KNOWN BUGS (failing tests document these intentionally):
 *   - page=9999 causes 500 (same root cause as search endpoint)
 *   - page=0 / page=-1 / limit=0 cause 500 (missing input guard)
 */

import constants from '../../config/constants.js';
import axios from '../../utils/axiosConfig.js';
import User from '../../../src/models/User.model.js';
import { Student } from '../../../src/models/student.model.js';
import connectDB, { disconnectDB } from '../../../src/config/db.js';

// ─────────────────────────────────────────────────────────────
// Environment helpers
// ─────────────────────────────────────────────────────────────
/**
 * If RECO_TEST_TOKEN env var is set (useful in CI), we skip DB seed
 * and use that pre-minted token directly.
 */
const ENV_TOKEN = process.env.RECO_TEST_TOKEN || '';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const BASE = '/api/v1/students/jobs/recommended';

const url = (params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null),
  ).toString();
  return qs ? `${BASE}?${qs}` : BASE;
};

/**
 * Make an authenticated GET request.
 * @param {string} path
 * @param {string|undefined} token  — overrides the shared axios token when set
 */
const safeGet = async (path, token) => {
  const startedAt = Date.now();
  // #region agent log
  fetch('http://127.0.0.1:7620/ingest/69725dc7-e916-4c2c-a5ae-15f1acf3d3af',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'71136c'},body:JSON.stringify({sessionId:'71136c',runId:'pre-fix-reco',hypothesisId:'H8',location:'tests/api/jobs/job.recommended.test.js:55',message:'Recommended safeGet start',data:{path,tokenMode:token===undefined?'shared':token===''?'empty-header':token?'explicit-token':'falsy-token'},timestamp:startedAt})}).catch(()=>{});
  console.log('[agent-debug reco safeGet start]', {
    path,
    tokenMode: token === undefined ? 'shared' : token === '' ? 'empty-header' : token ? 'explicit-token' : 'falsy-token',
  });
  // #endregion
  try {
    const config =
      token !== undefined
        ? {
            headers: token
              ? { Authorization: `Bearer ${token}` }
              : { 'X-Skip-Auth-Injection': '1' },
          }
        : {};
    const response = await axios.get(path, config);
    // #region agent log
    fetch('http://127.0.0.1:7620/ingest/69725dc7-e916-4c2c-a5ae-15f1acf3d3af',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'71136c'},body:JSON.stringify({sessionId:'71136c',runId:'pre-fix-reco',hypothesisId:'H8',location:'tests/api/jobs/job.recommended.test.js:63',message:'Recommended safeGet success',data:{path,status:response.status,elapsedMs:Date.now()-startedAt},timestamp:Date.now()})}).catch(()=>{});
    console.log('[agent-debug reco safeGet success]', {
      path,
      status: response.status,
      elapsedMs: Date.now() - startedAt,
    });
    // #endregion
    return response;
  } catch (err) {
    // #region agent log
    fetch('http://127.0.0.1:7620/ingest/69725dc7-e916-4c2c-a5ae-15f1acf3d3af',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'71136c'},body:JSON.stringify({sessionId:'71136c',runId:'pre-fix-reco',hypothesisId:'H8',location:'tests/api/jobs/job.recommended.test.js:67',message:'Recommended safeGet error',data:{path,status:err?.response?.status??null,code:err?.code??null,message:err?.message??null,elapsedMs:Date.now()-startedAt},timestamp:Date.now()})}).catch(()=>{});
    console.log('[agent-debug reco safeGet error]', {
      path,
      status: err?.response?.status ?? null,
      code: err?.code ?? null,
      message: err?.message ?? null,
      elapsedMs: Date.now() - startedAt,
    });
    // #endregion
    if (err.response) return err.response;
    throw err;
  }
};

// ─────────────────────────────────────────────────────────────
describe('Recommended Jobs API — GET /api/v1/students/jobs/recommended', () => {
  jest.setTimeout(30_000);

  // ── Test fixtures ──
  const ts = Date.now();
  const fullProfileUser = {
    email: `reco-full-${ts}@test.com`,
    password: 'password123',
    fullName: 'Reco Full Profile',
    authMethod: 'local',
    isEmailVerified: true,
  };
  const emptyProfileUser = {
    email: `reco-empty-${ts}@test.com`,
    password: 'password123',
    fullName: 'Reco Empty Profile',
    authMethod: 'local',
    isEmailVerified: true,
  };

  let fullProfileToken;
  let emptyProfileToken;
  let fullUserId;
  let emptyUserId;

  beforeAll(async () => {
    if (ENV_TOKEN) {
      // CI or remote-server mode: skip DB seed, use pre-minted token
      fullProfileToken = ENV_TOKEN;
      emptyProfileToken = ENV_TOKEN; // same token is fine for remote runs
      constants.ACCESS_TOKEN = fullProfileToken;
      return;
    }

    // Local mode: seed DB and generate fresh tokens
    await connectDB();

    // Rich-profile user
    const fullUser = new User(fullProfileUser);
    await fullUser.save();
    fullUserId = fullUser._id;
    fullProfileToken = fullUser.generateAccessToken();

    // Seed a Student document — Student._id IS the User._id
    await Student.findOneAndUpdate(
      { _id: fullUserId },
      {
        $setOnInsert: {
          fullName: fullProfileUser.fullName,
          email: fullProfileUser.email,
        },
        $set: {
          skills: [
            { skillId: `js-${ts}`, skill: 'JavaScript', level: 'ADVANCED' },
            { skillId: `react-${ts}`, skill: 'React', level: 'INTERMEDIATE' },
            { skillId: `node-${ts}`, skill: 'Node.js', level: 'ADVANCED' },
          ],
          location: 'Bengaluru, Karnataka, IN',
          jobRole: 'Software Engineer',
          experience: [
            {
              company: 'TechCorp',
              designation: 'Frontend Developer',
              startDate: '2022-01-01',
              currentlyWorking: true,
              experienceId: `techcorp-${ts}`,
            },
          ],
        },
      },
      { upsert: true, new: true },
    );

    // Empty-profile user (no skills, no experience)
    const emptyUser = new User(emptyProfileUser);
    await emptyUser.save();
    emptyUserId = emptyUser._id;
    emptyProfileToken = emptyUser.generateAccessToken();

    // Prime the shared axios instance with the full-profile token
    constants.ACCESS_TOKEN = fullProfileToken;
    // #region agent log
    fetch('http://127.0.0.1:7620/ingest/69725dc7-e916-4c2c-a5ae-15f1acf3d3af',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'71136c'},body:JSON.stringify({sessionId:'71136c',runId:'pre-fix-reco',hypothesisId:'H9',location:'tests/api/jobs/job.recommended.test.js:152',message:'Recommended beforeAll seeded users',data:{hasFullProfileToken:!!fullProfileToken,hasEmptyProfileToken:!!emptyProfileToken,fullUserId:String(fullUserId),emptyUserId:String(emptyUserId)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  });

  afterAll(async () => {
    if (ENV_TOKEN) return; // nothing to clean up in CI/remote mode
    await User.deleteMany({
      email: { $in: [fullProfileUser.email, emptyProfileUser.email] },
    });
    await Student.deleteMany({ _id: { $in: [fullUserId, emptyUserId] } });
    await disconnectDB();
  });

  // ──────────────────────────────────────────────────
  // 1. AUTHENTICATION & AUTHORIZATION
  // ──────────────────────────────────────────────────
  describe('1. Authentication & Authorization', () => {
    it('1.1 missing auth token → 401 or 403', async () => {
      const res = await safeGet(url(), '');
      expect([401, 403]).toContain(res.status);
    });

    it('1.2 invalid / malformed token → 401 or 403', async () => {
      const res = await safeGet(url(), 'not.a.valid.jwt');
      expect([401, 403]).toContain(res.status);
    });

    it('1.3 valid student token → 200', async () => {
      constants.ACCESS_TOKEN = fullProfileToken;
      const res = await safeGet(url());
      expect(res.status).toBe(200);
    });
  });

  // ──────────────────────────────────────────────────
  // 2. POSITIVE SCENARIOS
  // ──────────────────────────────────────────────────
  describe('2. Positive Scenarios', () => {
    beforeEach(() => {
      constants.ACCESS_TOKEN = fullProfileToken;
    });

    it('2.1 returns 200 and a jobs array', async () => {
      const res = await safeGet(url());
      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(Array.isArray(res.data.jobs)).toBe(true);
    });

    it('2.2 response contains pagination metadata', async () => {
      const res = await safeGet(url({ page: 1, limit: 5 }));
      expect(res.status).toBe(200);
      const { pagination } = res.data;
      expect(pagination).toBeDefined();
      expect(typeof pagination.currentPage).toBe('number');
      expect(typeof pagination.hasNextPage).toBe('boolean');
      expect(typeof pagination.totalJobs).toBe('number');
    });

    it('2.3 each returned job has title and company fields', async () => {
      const res = await safeGet(url({ limit: 3 }));
      expect(res.status).toBe(200);
      res.data.jobs.forEach((job) => {
        expect(job).toHaveProperty('title');
        expect(job).toHaveProperty('company');
      });
    });

    it('2.4 pagination.currentPage matches requested page', async () => {
      const res = await safeGet(url({ page: 2, limit: 10 }));
      expect(res.status).toBe(200);
      expect(res.data.pagination.currentPage).toBe(2);
    });

    it('2.5 jobs returned ≤ requested limit', async () => {
      const limit = 10;
      const res = await safeGet(url({ page: 1, limit }));
      expect(res.status).toBe(200);
      expect(res.data.jobs.length).toBeLessThanOrEqual(limit);
    });

    it('2.6 success=true is present in the 200 response', async () => {
      const res = await safeGet(url({ page: 1, limit: 10 }));
      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────
  // 3. PAGINATION
  // ──────────────────────────────────────────────────
  describe('3. Pagination', () => {
    beforeEach(() => {
      constants.ACCESS_TOKEN = fullProfileToken;
    });

    it('3.1 page 1 and page 2 should not share job IDs', async () => {
  const [res1, res2] = await Promise.all([
    safeGet(url({ page: 1, limit: 10 })),
    safeGet(url({ page: 2, limit: 10 })),
  ]);

  expect(res1.status).toBe(200);
  expect(res2.status).toBe(200);

  const ids1 = new Set(res1.data.jobs.map((j) => String(j.jobId)));
  const ids2 = res2.data.jobs.map((j) => String(j.jobId));

  const overlap = ids2.filter((id) => ids1.has(id));
  console.log("Page1 IDs:", [...ids1]);
  console.log("Page2 IDs:", ids2);
  console.log("Overlap:", overlap);

  expect(overlap.length).toBe(0);
});

    it('3.2 limit=10 returns at least 10 job', async () => {
      const res = await safeGet(url({ limit: 10 }));
      expect(res.status).toBe(200);
      expect(res.data.jobs.length).toBeGreaterThanOrEqual(10);
    });

    it('3.3 hasNextPage is false when 0 jobs are returned', async () => {
      // A very high page number almost certainly has no jobs
      const res = await safeGet(url({ page: 9999, limit: 10 }));
      if (res.status === 200 && res.data.jobs.length === 0) {
        expect(res.data.pagination.hasNextPage).toBe(false);
      }
    }, 70_000);

    /**
     * 🐛 BUG: page=9999 currently causes 500.
     * Expected behaviour: return empty jobs array with 200.
     */
    it('3.4 [BUG] page=9999 should return empty array gracefully — currently 500', async () => {
      const res = await safeGet(url({ page: 9999, limit: 10 }));
      expect(res.status).not.toBe(500); // fails until bug is fixed
      expect(Array.isArray(res.data.jobs)).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────
  // 4. NEGATIVE / VALIDATION SCENARIOS
  // ──────────────────────────────────────────────────
  describe('4. Negative / Validation Scenarios', () => {
    beforeEach(() => {
      constants.ACCESS_TOKEN = fullProfileToken;
    });

    /**
     * 🐛 BUG: page=0 / page=-5 / limit=0 cause 500.
     * Fix: validate & coerce input before computing requiredPoolSize.
     */
    it('4.1 [BUG] page=0 should coerce to 1 — currently returns 500', async () => {
      const res = await safeGet(url({ page: 0 }));
      expect(res.status).not.toBe(500);
    });

    it('4.2 [BUG] page=-5 should be coerced — currently returns 500', async () => {
      const res = await safeGet(url({ page: -5 }));
      expect(res.status).not.toBe(500);
    });

    it('4.3 [BUG] limit=0 should coerce to default — currently returns 500', async () => {
      const res = await safeGet(url({ limit: 0 }));
      expect(res.status).not.toBe(500);
    });

    it('4.4 page=NaN string is safely coerced (not 500)', async () => {
      const res = await safeGet(url({ page: 'NaN' }));
      // The controller already handles NaN via `parseInt(page) || 1`
      expect([200, 400]).toContain(res.status);
    });

    it('4.5 limit=NaN string is safely coerced (not 500)', async () => {
      const res = await safeGet(url({ limit: 'NaN' }));
      expect([200, 400]).toContain(res.status);
    });
  });

  // ──────────────────────────────────────────────────
  // 5. FALLBACK LOGIC (SPARSE / EMPTY PROFILE)
  // ──────────────────────────────────────────────────
  describe('5. Fallback Logic', () => {
    it('5.1 empty-profile user still gets 200 (external-API fallback)', async () => {
      constants.ACCESS_TOKEN = emptyProfileToken;
      const res = await safeGet(url({ page: 1, limit: 5 }));
      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
    });

    it('5.2 jobs returned for empty-profile user are valid objects', async () => {
      constants.ACCESS_TOKEN = emptyProfileToken;
      const res = await safeGet(url({ page: 1, limit: 5 }));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.jobs)).toBe(true);
      res.data.jobs.forEach((job) => {
        expect(typeof job.title).toBe('string');
      });
    });

    it('5.3 full-profile user gets at least as many jobs as empty-profile user', async () => {
      const [resFull, resEmpty] = await Promise.all([
        safeGet(url({ page: 1, limit: 10 }), fullProfileToken),
        safeGet(url({ page: 1, limit: 10 }), emptyProfileToken),
      ]);
      expect(resFull.status).toBe(200);
      expect(resEmpty.status).toBe(200);
      console.log(
        `[Profile] full=${resFull.data.jobs.length} empty=${resEmpty.data.jobs.length}`,
      );
      expect(resFull.data.jobs.length).toBeGreaterThanOrEqual(
        resEmpty.data.jobs.length - 2, // allow minor variance
      );
    });
  });

  // ──────────────────────────────────────────────────
  // 6. RESPONSE INTEGRITY
  // ──────────────────────────────────────────────────
  describe('6. Response Integrity', () => {
    beforeEach(() => {
      constants.ACCESS_TOKEN = fullProfileToken;
    });

    it('6.1 no duplicate _id values within a single page', async () => {
      const res = await safeGet(url({ page: 1, limit: 10 }));
      expect(res.status).toBe(200);
      const ids = res.data.jobs.map((j) => String(j._id));
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('6.2 all returned jobs should be active (isActive=true)', async () => {
      const res = await safeGet(url({ page: 1, limit: 10 }));
      expect(res.status).toBe(200);
      res.data.jobs.forEach((job) => {
        if (Object.prototype.hasOwnProperty.call(job, 'isActive')) {
          expect(job.isActive).toBe(true);
        }
      });
    });

    it('6.3 pagination.totalJobs >= jobs.length', async () => {
      const res = await safeGet(url({ page: 1, limit: 10 }));
      expect(res.status).toBe(200);
      expect(res.data.pagination.totalJobs).toBeGreaterThanOrEqual(
        res.data.jobs.length,
      );
    });

    it('6.4 applied jobs must NOT be recommended (cross-check via API response shape)', async () => {
      // The de-duplication of applied jobs is enforced by applyFilters() which has its
      // own unit tests in tests/utils/jobHelpers.test.js.
      // Here we confirm the endpoint itself doesn't error out.
      const res = await safeGet(url({ page: 1, limit: 10 }));
      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────
  // 7. PERFORMANCE GUARD
  // ──────────────────────────────────────────────────
  describe('7. Performance Guard', () => {
    beforeEach(() => {
      constants.ACCESS_TOKEN = fullProfileToken;
    });

    it('7.1 first-page recommendation responds within 20 seconds', async () => {
      const before = Date.now();
      const res = await safeGet(url({ page: 1, limit: 10 }));
      const elapsed = Date.now() - before;
      console.log(`[Perf] Recommended jobs: ${elapsed}ms`);
      expect(res.status).toBe(200);
      expect(elapsed).toBeLessThan(20_000);
    });

    it('7.2 second (warm cache) request is not dramatically slower than the first', async () => {
      const fetch = () => safeGet(url({ page: 1, limit: 5 }));

      const t0 = Date.now();
      const res1 = await fetch();
      const first = Date.now() - t0;

      const t1 = Date.now();
      const res2 = await fetch();
      const second = Date.now() - t1;

      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
      console.log(`[Perf] Reco 1st=${first}ms 2nd=${second}ms`);
      // Warm path should be ≤ 3× cold path (+ 2 s buffer)
      expect(second).toBeLessThan(first * 3 + 2000);
    });

    it('7.3 three concurrent same-user requests all succeed', async () => {
      const results = await Promise.all(
        [1, 2, 3].map((p) => safeGet(url({ page: p, limit: 5 }))),
      );
      results.forEach((res) => {
        expect(res.status).toBe(200);
      });
    });
  });
});

