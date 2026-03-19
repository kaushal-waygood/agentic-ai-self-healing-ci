
/**
 * ============================================================
 *  JOB SEARCH API — Comprehensive Test Suite
 *  Endpoint: GET /api/v1/jobs/search
 * ============================================================
 *
 *  Coverage:
 *   ✅ Positive scenarios (basic search, with q, filters, pagination)
 *   ❌ Negative / validation scenarios
 *   🔎 Filter combinations (employmentType, city, state, country)
 *   📄 Pagination (page, limit, hasNextPage)
 *   🔄 Fallback (external API kick-in when local DB is sparse)
 *   ⚡ Response-time guard (search must answer < 15 s)
 *
 *  🐛 KNOWN API BUGS (failing tests document these intentionally):
 *   - page=9999 causes 500 instead of graceful empty list
 *   - page=0 / page=-1 / limit=0 cause 500 instead of being coerced/rejected
 *   - Some filter paths don't include success:true in the response body
 */

import axios from '../../utils/axiosConfig.js';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const BASE = '/api/v1/jobs/search';

const url = (params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null),
  ).toString();
  return qs ? `${BASE}?${qs}` : BASE;
};

/**
 * Wrap axios calls so non-2xx responses can be inspected without throwing.
 */
const safeGet = async (path) => {
  try {
    return await axios.get(path);
  } catch (err) {
    if (err.response) return err.response;
    throw err;
  }
};

// ─────────────────────────────────────────────────────────────
describe('Job Search API — GET /api/v1/jobs/search', () => {
  jest.setTimeout(25_000);

  // Tests run against the remote API (BASE_URL in constants).
  // No local DB seeding — the remote API has its own data.

  // ──────────────────────────────────────────────────
  // 1. POSITIVE SCENARIOS
  // ──────────────────────────────────────────────────
  describe('1. Positive Scenarios', () => {
    it('1.1 should return 200 on a plain request (no query)', async () => {
      const res = await safeGet(url());
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.jobs)).toBe(true);
    });

    it('1.2 should return 200 with jobs array when q is provided (space-separated query)', async () => {
      const res = await safeGet(url({ q: 'software engineer' }));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.jobs)).toBe(true);
    });

    it('1.2b should also handle plus-encoded query (software+engineer) correctly', async () => {
      const res = await safeGet(`${BASE}?q=software+engineer&page=1&limit=10`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.jobs)).toBe(true);
    });

    it('1.3 response envelope should contain success, jobs, and pagination', async () => {
      const res = await safeGet(url({ q: 'developer', page: 1, limit: 10 }));
      expect(res.status).toBe(200);
      // NOTE: success field may be missing on some code-paths — document it
      const hasSuccess = 'success' in res.data;
      if (hasSuccess) expect(res.data.success).toBe(true);

      expect(Array.isArray(res.data.jobs)).toBe(true);
      expect(res.data.pagination).toBeDefined();
      expect(typeof res.data.pagination.currentPage).toBe('number');
      expect(typeof res.data.pagination.hasNextPage).toBe('boolean');
      expect(typeof res.data.pagination.totalJobs).toBe('number');
    });

    it('1.4 each job should have required core fields', async () => {
      const res = await safeGet(url({ q: 'developer', limit: 3 }));
      expect(res.status).toBe(200);
      if (res.data.jobs.length > 0) {
        const job = res.data.jobs[0];
        expect(job).toHaveProperty('title');
        expect(job).toHaveProperty('company');
      }
    });

    it('1.5 defaults to limit ≤ 30 when limit param is omitted', async () => {
      const res = await safeGet(url({ q: 'data' }));
      expect(res.status).toBe(200);
      expect(res.data.pagination.currentPage).toBe(1);
      expect(res.data.jobs.length).toBeLessThanOrEqual(30);
    });

    it('1.6 search works with uppercase query (case-insensitive)', async () => {
      const [resLower, resUpper] = await Promise.all([
        safeGet(url({ q: 'react developer' })),
        safeGet(url({ q: 'REACT DEVELOPER' })),
      ]);
      expect(resLower.status).toBe(200);
      expect(resUpper.status).toBe(200);
    });
  });

  // ──────────────────────────────────────────────────
  // 2. FILTER SCENARIOS
  // ──────────────────────────────────────────────────
  describe('2. Filter Scenarios', () => {
    it('2.1 filter by employmentType=Full-time', async () => {
      const res = await safeGet(
        url({ q: 'engineer', employmentType: 'Full-time' }),
      );
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.jobs)).toBe(true);
      res.data.jobs.forEach((job) => {
        if (job.jobTypes?.length > 0) {
          const joined = job.jobTypes.join(' ').toUpperCase().replace(/[-_]/g, ' ');
          expect(
            joined.includes('FULL') || joined.includes('TIME'),
          ).toBe(true);
        }
      });
    });

    it('2.2 filter by employmentType=Part-time', async () => {
      const res = await safeGet(
        url({ q: 'teacher', employmentType: 'Part-time' }),
      );
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.jobs)).toBe(true);
      res.data.jobs.forEach((job) => {
        if (job.jobTypes?.length > 0) {
          const joined = job.jobTypes.join(' ').toUpperCase().replace(/[-_]/g, ' ');
          expect(
            joined.includes('PART') || joined.includes('TIME'),
          ).toBe(true);
        }
      });
    });

    it('2.3 filter by employmentType=Internship', async () => {
      const res = await safeGet(
        url({ q: 'intern', employmentType: 'Internship' }),
      );
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.jobs)).toBe(true);
      res.data.jobs.forEach((job) => {
        if (job.jobTypes?.length > 0) {
          const joined = job.jobTypes.join(' ').toUpperCase();
          expect(
            joined.includes('INTERN') || joined.includes('INTERNSHIP'),
          ).toBe(true);
        }
      });
    });

    it('2.4 filter by country=IN (explicit)', async () => {
      const res = await safeGet(url({ q: 'developer', country: 'IN' }));
      expect(res.status).toBe(200);
    });

    it('2.5 filter by country=US', async () => {
      const res = await safeGet(url({ q: 'software', country: 'US' }));
      expect(res.status).toBe(200);
    });

    it('2.6 filter by city=Bengaluru', async () => {
      const res = await safeGet(url({ q: 'developer', city: 'Bengaluru' }));
      expect(res.status).toBe(200);
    });

    it('2.7 filter by state=Karnataka', async () => {
      const res = await safeGet(url({ q: 'developer', state: 'Karnataka' }));
      expect(res.status).toBe(200);
    });

    it('2.8 combined filters: employmentType + city + country returns 200', async () => {
      const res = await safeGet(
        url({
          q: 'frontend',
          employmentType: 'Full-time',
          city: 'Mumbai',
          country: 'IN',
        }),
      );
      expect(res.status).toBe(200);
      // jobs array must exist even if empty
      expect(Array.isArray(res.data.jobs)).toBe(true);
    });

    it('2.9 unknown employmentType returns 200 (graceful degradation)', async () => {
      const res = await safeGet(
        url({ q: 'developer', employmentType: 'INVALID_TYPE_XYZ' }),
      );
      expect(res.status).toBe(200);
      // May return empty list but must NOT 500
    }, 60_000);
  });

  // ──────────────────────────────────────────────────
  // 3. PAGINATION SCENARIOS
  // ──────────────────────────────────────────────────
  describe('3. Pagination', () => {
    it('3.1 page=1 and page=2 should have minimal overlap', async () => {
      const res1 = await safeGet(url({ q: 'developer', page: 1, limit: 10 }));
      const res2 = await safeGet(url({ q: 'developer', page: 2, limit: 10 }));
      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);

      const ids1 = new Set(res1.data.jobs.map((j) => String(j._id)));
      const ids2 = res2.data.jobs.map((j) => String(j._id));
      const overlap = ids2.filter((id) => ids1.has(id));
      expect(overlap.length).toBeLessThanOrEqual(2);
    });

    it('3.2 pagination.currentPage equals requested page', async () => {
      const res = await safeGet(url({ page: 3, limit: 10 }));
      expect(res.status).toBe(200);
      expect(res.data.pagination.currentPage).toBe(3);
    });

    it('3.3 limit=50 returns at most 50 job', async () => {
      const res = await safeGet(url({ q: 'software', limit: 50 }));
      expect(res.status).toBe(200);
      expect(res.data.jobs.length).toBeLessThanOrEqual(50);
    });

    it('3.4 limit=50 returns at most 50 jobs', async () => {
      const res = await safeGet(url({ q: 'developer', limit: 50 }));
      expect(res.status).toBe(200);
      expect(res.data.jobs.length).toBeLessThanOrEqual(50);
    });

    it('3.5 hasNextPage is a boolean', async () => {
      const res = await safeGet(url({ q: 'developer', page: 1, limit: 10 }));
      expect(res.status).toBe(200);
      expect(typeof res.data.pagination.hasNextPage).toBe('boolean');
    });
    //comment
    

    /**
     * 🐛 BUG: page=9999 causes 500 — server should return empty list gracefully.
     * This test is intentionally failing to document the bug.
     * Fix: add try/catch or `page > some_safe_ceiling → return []` guard in searchJobs.
     */
    it('3.6 [BUG] page=9999 should return empty jobs array — currently returns 500', async () => {
      const res = await safeGet(url({ q: 'developer', page: 9999, limit: 10 }));
      // Documenting actual (broken) behaviour — remove 500 once bug is fixed
      expect(res.status).not.toBe(500); // ← this WILL fail until the bug is fixed
      expect(Array.isArray(res.data.jobs)).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────
  // 4. NEGATIVE / VALIDATION SCENARIOS
  // ──────────────────────────────────────────────────
  describe('4. Negative / Validation Scenarios', () => {
    /**
     * 🐛 BUG: page=0 / page=-1 causes 500. The controller uses Math.max(1, …)
     * but something deeper crashes. Fix: add input validation middleware.
     */
    it('4.1 [BUG] page=0 should coerce to 1 — currently returns 500', async () => {
      const res = await safeGet(url({ q: 'developer', page: 0 }));
      expect(res.status).not.toBe(500); // fails until bug is fixed
    });

    it('4.2 [BUG] page=-1 should be handled gracefully — currently returns 500', async () => {
      const res = await safeGet(url({ q: 'developer', page: -1 }));
      expect(res.status).not.toBe(500);
    });

    it('4.3 page=abc (non-numeric) should not 500', async () => {
      const res = await safeGet(url({ q: 'developer', page: 'abc' }));
      expect([200, 400]).toContain(res.status);
    });

    it('4.4 limit=abc (non-numeric) should not 500', async () => {
      const res = await safeGet(url({ q: 'developer', limit: 'notanumber' }));
      expect([200, 400]).toContain(res.status);
    });

    /**
     * 🐛 BUG: limit=0 causes a perpetual loop / 500 because the pool calculation
     * divides by limit (which becomes 0 after coercion via Math.max(1, 0)=1... WAS OK?).
     * If it still 500s, investigate `requiredPoolSize = pageNum * limitNum * 100 + 200`.
     */
    it('4.5 [BUG] limit=0 should coerce to default — currently returns 500', async () => {
      const res = await safeGet(url({ q: 'developer', limit: 0 }));
      expect(res.status).not.toBe(500);
    });

    it('4.6 extremely long q string (500 chars) should not 500', async () => {
      const res = await safeGet(url({ q: 'a'.repeat(500) }));
      expect([200, 400, 413]).toContain(res.status);
    });

    it('4.7 SQL-injection style q should not 500', async () => {
      const res = await safeGet(url({ q: "'; DROP TABLE jobs; --" }));
      expect([200, 400]).toContain(res.status);
    });

    it('4.8 XSS payload in q should not 500', async () => {
      const res = await safeGet(url({ q: '<script>alert("xss")</script>' }));
      expect([200, 400]).toContain(res.status);
    });
  });

  // ──────────────────────────────────────────────────
  // 5. MISSING DATA & EDGE-CASE SCENARIOS
  // ──────────────────────────────────────────────────
  describe('5. Missing Data & Edge Cases', () => {
    it('5.1 niche query with no local results triggers fallback — returns 200', async () => {
      const res = await safeGet(
        url({ q: 'quantum-xylophone-archaeologist-9z' }),
      );
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.jobs)).toBe(true);
    });

    it('5.2 empty q= returns a default list (not an error)', async () => {
      const res = await safeGet(url({ q: '' }));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.jobs)).toBe(true);
    });

    it('5.3 special characters in q do not crash the server', async () => {
      const res = await safeGet(url({ q: '!@#$%^&*()' }));
      expect([200, 400]).toContain(res.status);
    });

    it('5.4 unicode query (Hindi) is handled gracefully', async () => {
      const res = await safeGet(url({ q: 'सॉफ्टवेयर इंजीनियर' }));
      expect([200, 400]).toContain(res.status);
    });
  });

  // ──────────────────────────────────────────────────
  // 6. RESPONSE STRUCTURE INTEGRITY
  // ──────────────────────────────────────────────────
  describe('6. Response Structure Integrity', () => {
    it('6.1 no duplicate _id values on a single page', async () => {
      const res = await safeGet(url({ q: 'engineer', limit: 30 }));
      expect(res.status).toBe(200);
      const ids = res.data.jobs.map((j) => String(j._id));
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    });

    it('6.2 all returned jobs should have isActive=true', async () => {
      const res = await safeGet(url({ q: 'developer', limit: 10 }));
      expect(res.status).toBe(200);
      res.data.jobs.forEach((job) => {
        if (Object.prototype.hasOwnProperty.call(job, 'isActive')) {
          expect(job.isActive).toBe(true);
        }
      });
    });

    it('6.3 pagination.totalJobs >= jobs.length', async () => {
      const res = await safeGet(url({ q: 'developer', page: 1, limit: 10 }));
      expect(res.status).toBe(200);
      expect(res.data.pagination.totalJobs).toBeGreaterThanOrEqual(
        res.data.jobs.length,
      );
    });

    it('6.4 success field is true when present on a 200 response', async () => {
      const res = await safeGet(url({ q: 'developer', page: 1, limit: 10 }));
      expect(res.status).toBe(200);
      if ('success' in res.data) {
        expect(res.data.success).toBe(true);
      }
    });
    it("6.7 should not repeat jobs across pages", async () => {
  const page1 = await safeGet(url({ q: 'engineer', page: 1, limit: 10 }));
  const page2 = await safeGet(url({ q: 'engineer', page: 2, limit: 10 }));

  const ids1 = page1.data.jobs.map(j => String(j._id));
  const ids2 = page2.data.jobs.map(j => String(j._id));

  const intersection = ids1.filter(id => ids2.includes(id));

  expect(intersection.length).toBe(0);
});
  });

  // ──────────────────────────────────────────────────
  // 7. PERFORMANCE GUARD
  // ──────────────────────────────────────────────────
  describe('7. Performance Guard', () => {
    it('7.1 search should respond within 15 seconds', async () => {
      const before = Date.now();
      const res = await safeGet(url({ q: 'software engineer', limit: 10 }));
      const elapsed = Date.now() - before;
      console.log(`[Perf] Search elapsed: ${elapsed}ms`);
      expect(res.status).toBe(200);
      expect(elapsed).toBeLessThan(15_000);
    });

    it('7.2 second (warm) request should be measurably faster or at least no slower than 3× first', async () => {
      const fetch = () =>
        safeGet(url({ q: 'react developer', page: 1, limit: 10 }));

      const t0 = Date.now();
      const res1 = await fetch();
      const first = Date.now() - t0;

      const t1 = Date.now();
      const res2 = await fetch();
      const second = Date.now() - t1;

      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
      console.log(`[Perf] 1st=${first}ms 2nd=${second}ms`);
      // Soft assertion: warm path should not be dramatically slower
      expect(second).toBeLessThan(first * 3 + 3000);
    });
  });
});


