---
description: All workflows for SearchJob feature — Search & Recommend flows across Frontend + Backend
---

# SearchJob Complete Workflow

This document covers **every case** of the SearchJob feature, including both the **Search** and **Recommend** flows across **Frontend** (Next.js / Redux / Saga) and **Backend** (Express / MongoDB / RapidAPI).

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Frontend Entry Points](#2-frontend-entry-points)
3. [Case 1 — Recommended Jobs (Empty Filters)](#3-case-1--recommended-jobs-empty-filters)
4. [Case 2 — Search Jobs (With Filters)](#4-case-2--search-jobs-with-filters)
5. [Case 3 — Filter Change (User Applies Filters)](#5-case-3--filter-change-user-applies-filters)
6. [Case 4 — Pagination / Infinite Scroll (Load More)](#6-case-4--pagination--infinite-scroll-load-more)
7. [Case 5 — Cache Hit (No API Call)](#7-case-5--cache-hit-no-api-call)
8. [Backend Pipeline Detail](#8-backend-pipeline-detail)
9. [File Map](#9-file-map)
10. [Sequence Diagrams](#10-sequence-diagrams)

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                    │
│                                                                          │
│  SearchJobsPage ──▸ JobsPage ──▸ useJobs() hook                         │
│       │                              │                                   │
│       │                     ┌────────┴────────┐                          │
│       │                     ▼                  ▼                         │
│       │        SearchFilters.tsx         JobCard / JobDetail              │
│       │              │                                                   │
│       │      URL sync (push ?q=...)                                      │
│       │              │                                                   │
│       ▼              ▼                                                   │
│  useJobs() useEffect ──▸ Decides: Search or Recommend?                   │
│       │                                                                  │
│       ├─ Filters empty? ──▸ dispatch(getRecommendJobsRequest)            │
│       │                                                                  │
│       └─ Has filters?   ──▸ dispatch(searchJobRequest)                   │
│                │                                                         │
│         Redux Saga (jobSaga.ts)                                          │
│         ├── searchJobsSaga  ──▸ GET /api/v1/jobs/search?...              │
│         └── getRecommendJobsSaga ──▸ GET /api/v1/students/jobs/recommended│
│                │                                                         │
│         jobCache.ts (in-memory TTL cache)                                │
│                │                                                         │
│         jobReducer.ts ──▸ state.jobs / state.pagination / state.loading   │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                              BACKEND                                     │
│                                                                          │
│  GET /api/v1/jobs/search                                                 │
│  └── job.controller.js → searchJobs()                                    │
│       ├── buildSearchContext(req)                                        │
│       ├── retrieveLocalCandidates(context, poolSize)                     │
│       │    ├── keywordSearch()    ─ MongoDB text/regex                    │
│       │    └── vectorSearch()    ─ MongoDB Atlas Vector Search            │
│       ├── applyFilters()  ─ country/state/city/type + interactions        │
│       ├── rankJobs()      ─ freshness + geo + vector + relevance          │
│       ├── diversify()     ─ max 3 per company                            │
│       ├── [FALLBACK] fetchExternalJobs() ─ RapidAPI JSearch              │
│       │    └── transformRapidApiJob() → upsertExternalJobs()             │
│       └── Track impressions (JobInteraction.insertMany)                   │
│                                                                          │
│  GET /api/v1/students/jobs/recommended                                   │
│  └── student.controller.js → getProfileBasedRecommendedJobs()            │
│       ├── buildUserProfileFromStudent(userId)                            │
│       ├── buildInteractionContext(userId)                                │
│       ├── retrieveLocalCandidates(context, poolSize)                     │
│       ├── applyFilters() → rankJobs() → diversify()                     │
│       └── [FALLBACK] fetchExternalJobs() → upsertExternalJobs()         │
│                                                                          │
│  Shared Utilities: jobHelpers.js                                         │
│  Redis Cache: 600s for local candidates, 3600s for RapidAPI results      │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Entry Points

### Pages that trigger the workflow

| Path                     | Component                        | Auth Required |
| ------------------------ | -------------------------------- | ------------- |
| `/dashboard/search-jobs` | `searchJobPage.tsx` → `JobsPage` | ✅ Yes        |
| `/search-jobs`           | `JobsPage`                       | ❌ No         |

### Key Hook: `useJobs()` — `frontend/src/hooks/jobs/useJobs.tsx`

This is the **central orchestrator**. It:

1. Reads URL search params (`?q=`, `?country=`, `?employmentType=`)
2. Decides whether to fire **Search** or **Recommend** based on whether filters are empty
3. Manages pagination via `loadMoreJobs()`
4. Pre-checks the in-memory cache before dispatching to avoid loading flash

---

## 3. Case 1 — Recommended Jobs (Empty Filters)

**Trigger:** User navigates to `/dashboard/search-jobs` with NO query params, or all params are empty.

### Frontend Flow

```
1. useJobs() useEffect fires
2. pathName === '/dashboard/search-jobs' → ✅
3. Extract search params: q='', country='', city='', etc.
4. isEmpty = true (all filters are empty)
5. Build cache key: makeCacheKey('recommend', { page: 1 })
6. Check cache → if hit: dispatch(setCacheHit(true)) to skip loading spinner
7. dispatch(getRecommendJobsRequest({ page: 1, append: false }))
```

### Redux Reducer (`jobReducer.ts`)

```
getRecommendJobsRequest:
  - if (!state.cacheHit) → state.loading = true
  - state.error = null
```

### Redux Saga (`jobSaga.ts` → `getRecommendJobsSaga`)

```
1. Extract { page, append } from action.payload
2. Build cache key: makeCacheKey('recommend', { page })
3. Check frontend cache (getCache)
   ├── HIT:  dispatch(setCacheHit(true)), dispatch(getRecommendJobsSuccess), RETURN
   └── MISS: continue to API call
4. call(getRecommendJobs, { page })
   └── GET /api/v1/students/jobs/recommended?page=1&limit=10
5. Store result in frontend cache: setCache(cacheKey, responseData)
6. dispatch(getRecommendJobsSuccess({ jobs, pagination, append }))
```

### API Service (`frontend/src/services/api/job.ts`)

```typescript
GET /api/v1/students/jobs/recommended?page=1&limit=10
Headers: Authorization: Bearer <token>
```

### Backend Flow (`student.controller.js` → `getProfileBasedRecommendedJobs`)

```
1. Parse page (default 1), limit (default 10)
2. buildUserProfileFromStudent(userId)
   └── Reads: Student profile, skills, education, experience, job preferences
   └── Builds: { titles: [...], skills: [...], location: {...} }
3. buildInteractionContext(userId)
   └── Reads: JobInteraction (VIEW, SAVED, APPLIED)
   └── Returns: { applied: Set, saved: Set, views: { id: decayScore } }
4. Build context:
   - type: 'recommendation'
   - query: "<titles> <skills>" joined string
   - profile: { titles, skills, location }
   - filters: { country, state, city } from profile
5. retrieveLocalCandidates(context, poolSize)
   └── Redis cache key: jobs:local:<md5 hash>
   └── If cached → return cached
   └── If not:
       ├── keywordSearch(context, limit, dateFilter)
       │   └── MongoDB regex search on title/queries/tags/company
       │   └── Date filter: last 30 days (for recommendations)
       ├── vectorSearch(context, limit, dateFilter)
       │   └── MongoDB Atlas $vectorSearch on job_embedding
       │   └── Score threshold: ≥ 0.935
       └── Combine, sort by jobPostedAt, dedupe
6. processPool(candidates):
   ├── applyFilters() → removes: applied/saved jobs, heavily-viewed (>5), wrong country/city/type
   ├── rankJobs()    → score = freshness(0.6) + geo(0.4) + vectorBonus + relevanceBonus
   └── diversify()   → max 3 jobs per company
7. Paginate: slice(skip, skip + limit)
8. API FALLBACK (if finalJobs.length < limit):
   ├── Build fallback query from first profile title/skill
   ├── Fetch 3 pages from RapidAPI JSearch in parallel
   ├── 12s timeout per request
   ├── transformRapidApiJob() each result
   ├── upsertExternalJobs() → bulk write to MongoDB
   └── processPool(formatted) and append to finalJobs
9. Return JSON:
   {
     success: true,
     jobs: [...],
     pagination: { currentPage, hasNextPage, totalJobs }
   }
```

---

## 4. Case 2 — Search Jobs (With Filters)

**Trigger:** User navigates to `/dashboard/search-jobs?q=react&country=IN` or types a search query.

### Frontend Flow

```
1. useJobs() useEffect fires
2. pathName matches → ✅
3. Extract: q='react', country='IN', etc.
4. isEmpty = false (at least one filter has a value)
5. Build payload: { query: 'react', country: 'IN', ..., page: 1, append: false }
6. Build cache key: makeCacheKey('search', payload)
7. Check cache → if hit: dispatch(setCacheHit(true))
8. dispatch(searchJobRequest(payload))
```

### Redux Saga (`jobSaga.ts` → `searchJobsSaga`)

```
1. Extract { append, page, ...rest } from action.payload
2. Build cache key: makeCacheKey('search', action.payload)
3. Check frontend cache
   ├── HIT:  dispatch(setCacheHit(true)), dispatch(searchJobSuccess), RETURN
   └── MISS: continue
4. call(searchJobs, { page, query, country, ... })
   └── GET /api/v1/jobs/search?page=1&limit=10&q=react&country=IN
5. Store in cache: setCache(cacheKey, responseData)
6. dispatch(searchJobSuccess({ jobs, pagination, append }))
```

### API Service

```typescript
GET /api/v1/jobs/search?page=1&limit=10&q=react&country=IN
// No auth required (public endpoint)
```

### Backend Flow (`job.controller.js` → `searchJobs`)

```
1. Parse: q, page (default 1), limit (default 30)
2. buildSearchContext(req):
   └── country = req.query.country || 'IN'
   └── state = req.query.state
   └── city = req.query.city
   └── query = req.query.q (lowercased, trimmed)
   └── employmentType = req.query.employmentType
   └── buildInteractionContext(req.user?._id) → applied/saved/views
3. requiredPoolSize = page * limit * 100 + 200
4. retrieveLocalCandidates(context, requiredPoolSize):
   └── Same 2-pronged approach: keywordSearch + vectorSearch in parallel
   └── Date filter: last 10 days (for search — tighter than recommendations)
   └── Redis cached for 600s
5. processPool(candidates):
   ├── applyFilters()
   ├── rankJobs()
   └── diversify()
6. Paginate: slice(start, start + limit)
7. FALLBACK (if paginatedJobs.length < limit):
   ├── apiFallbackQuery = q || employmentType || experience || 'jobs'
   ├── Fetch 3 pages from RapidAPI JSearch concurrently
   ├── 12s timeout
   ├── transformRapidApiJob() → upsertExternalJobs()
   ├── Merge with existing candidates (dedupeByTitleCompany)
   ├── Re-processPool → re-paginate
   └── Rebuild paginatedJobs
8. Track Impressions:
   └── JobInteraction.insertMany (type: IMPRESSION, source: 'search')
9. Return JSON:
   {
     success: true,
     jobs: [...],
     pagination: { currentPage, hasNextPage, totalJobs }
   }
```

---

## 5. Case 3 — Filter Change (User Applies Filters)

**Trigger:** User changes search query, country, employment type, etc. via `SearchFilters` component.

### Frontend Flow

```
1. SearchFilters → onSearchChange(newFilters)
2. → calls handleFilterChange(newFilters) from useJobs()
3. handleFilterChange:
   a. Merges current reduxFilters with newFilters
   b. Calls syncFiltersToUrl(combined)
      └── Builds URLSearchParams from filters
      └── router.push(`?${params.toString()}`, { scroll: false })
4. URL change triggers useJobs() useEffect (searchParams dependency)
5. useEffect detects new URL key (different from fetchedKeyRef)
6. Decides Search vs Recommend based on isEmpty
7. dispatch(searchJobRequest(...)) or dispatch(getRecommendJobsRequest(...))
```

### URL Sync Logic (`useJobs().syncFiltersToUrl`)

```
Filters → URL params mapping:
  query/q       → ?q=react
  country       → ?country=IN
  countryCode   → ?countryCode=IN
  state         → ?state=MH
  city          → ?city=Mumbai
  datePosted    → ?datePosted=week
  employmentType → ?employmentType=Full-time,Internship
  experience    → ?experience=Entry level,Mid level
```

### Important: Debounce mechanism

`debouncedSearch` (500ms debounce) exists but is currently **not the primary path**. The primary flow goes through URL push → useEffect → dispatch. The debounced path was used earlier and is kept as backup.

---

## 6. Case 4 — Pagination / Infinite Scroll (Load More)

**Trigger:** User scrolls to bottom → `loadMoreJobs()` called from `JobsPage` via IntersectionObserver.

### Frontend Flow

```
1. loadMoreJobs() called
2. Guards: if loadingRef.current OR !hasNextPage → RETURN
3. Compute currentPage from pagination (currentPage || page)
4. Re-read all URL search params
5. Determine if search is empty:
   ├── EMPTY (recommendation mode):
   │   └── dispatch(getRecommendJobsRequest({ page: currentPage + 1, append: true }))
   └── NOT EMPTY (search mode):
       └── dispatch(searchJobRequest({ ...reduxFilters, page: currentPage + 1, append: true }))
6. append: true → reducer APPENDS new jobs to state.jobs (deduplicated by _id/jobId)
```

### Reducer Append Logic (searchJobSuccess / getRecommendJobsSuccess)

```typescript
if (action.payload.append) {
  // Deduplicate using Map keyed by _id or jobId
  const jobsMap = new Map(state.jobs.map((job) => [job._id || job.jobId, job]));
  action.payload.jobs.forEach((job) => jobsMap.set(job._id || job.jobId, job));
  state.jobs = Array.from(jobsMap.values());
} else {
  state.jobs = action.payload.jobs; // Replace entirely
}
```

### Backend `hasNextPage` Logic

```javascript
// For both search and recommend:
hasNextPage: finalJobs.length >= limitNum || // We filled the page → probably more
  candidates.length >= requiredPoolSize; // Local pool was full → more available
```

---

## 7. Case 5 — Cache Hit (No API Call)

**Trigger:** User navigates back to previously loaded results within 5 minutes.

### Frontend Cache (`lib/jobCache.ts`)

```
Architecture:
  - In-memory Map<string, CacheEntry>
  - TTL: 5 minutes (CACHE_TTL_MS = 300,000 ms)
  - Max entries: 100
  - LRU-like pruning when over capacity
  - Deterministic keys via sorted JSON stringification

Cache Key Format:
  search:{"city":"Mumbai","country":"IN","page":1,"query":"react"}
  recommend:{"page":1}

Operations:
  - makeCacheKey(prefix, params) → deterministic key (ignores empty values + 'append')
  - getCache(key) → CachedJobData | undefined
  - setCache(key, data) → stores with TTL
  - invalidateByPrefix('search') → clears all search caches
  - invalidateByPrefix('recommend') → clears all recommend caches
```

### Flow When Cache Hits

```
1. Saga builds cache key
2. getCache(cacheKey) → returns { jobs, pagination }
3. dispatch(setCacheHit(true)) → tells reducer to NOT show loading spinner
4. dispatch(searchJobSuccess / getRecommendJobsSuccess) with cached data
5. RETURN early (no API call)
```

### Pre-cache Check in `useJobs()`

```
Before dispatching, useJobs() also pre-checks:
  const cacheKey = makeCacheKey('recommend', { page: 1 });
  if (getCache(cacheKey)) dispatch(setCacheHit(true));

This prevents the loading flash between dispatch and saga's cache check.
```

---

## 8. Backend Pipeline Detail

### Data Sources

| Source               | Description                                         | TTL Cache     |
| -------------------- | --------------------------------------------------- | ------------- |
| **MongoDB (Local)**  | Jobs collection with text index + vector embeddings | 600s (Redis)  |
| **RapidAPI JSearch** | External job API (JSearch)                          | 3600s (Redis) |

### Search Pipeline Functions (`jobHelpers.js`)

| Step | Function                                    | Purpose                                                             |
| ---- | ------------------------------------------- | ------------------------------------------------------------------- |
| 1    | `buildSearchContext(req)`                   | Build filters, interaction context, query from request              |
| 2    | `retrieveLocalCandidates(context, limit)`   | Combined keyword + vector search, Redis-cached                      |
| 2a   | `keywordSearch(context, limit, dateFilter)` | MongoDB regex on title/queries/tags/company per token               |
| 2b   | `vectorSearch(context, limit, dateFilter)`  | MongoDB Atlas `$vectorSearch` on `job_embedding` field              |
| 3    | `applyFilters(jobs, context)`               | Country/state/city/type matching + user interaction filtering       |
| 4    | `rankJobs(jobs, context)`                   | Score: `freshness * 0.6 + geo * 0.4 + vectorBonus + relevanceBonus` |
| 5    | `diversify(jobs)`                           | Cap at 3 jobs per company                                           |
| 6    | `fetchExternalJobs(...)`                    | RapidAPI JSearch call with location injection                       |
| 7    | `transformRapidApiJob(apiJob, query)`       | Transform JSearch format → ZobsAI Job schema                        |
| 8    | `upsertExternalJobs(jobs)`                  | Bulk upsert to MongoDB (preserves \_id/slug for existing)           |

### RapidAPI JSearch Integration

```javascript
// Endpoint: https://jsearch.p.rapidapi.com/search
// Headers: X-RapidAPI-Key, X-RapidAPI-Host

// Query construction:
query = 'react in Mumbai, India'; // user query + location parts

// Additional params:
params.employment_types = 'FULLTIME,PARTTIME'; // normalized
params.job_requirements = 'under_3_years_experience';
params.date_posted = 'week';
params.page = '1';
params.num_pages = '1';
```

### Employment Type Normalization Map

```
Frontend → Backend → RapidAPI:
  'Full-time'   → FULLTIME
  'Part-time'   → PARTTIME
  'Contract'    → CONTRACTOR
  'Internship'  → INTERN
  'Freelance'   → CONTRACTOR
```

### Interaction Filtering Logic (`applyFilters`)

```
Removes jobs where:
  1. job.isActive === false
  2. User has APPLIED to the job
  3. User has SAVED the job
  4. User has VIEWED the job > 5 times (with time-decay)
  5. Job country doesn't match (with fuzzy matching for "India"/"USA")
  6. Job state/city doesn't match (substring match)
  7. Employment type doesn't match (with alias handling)
```

### Ranking Formula (`rankJobs`)

```
rankScore = freshness * 0.6 + geo * 0.4 + vectorBonus + relevanceBonus

Where:
  freshness = exp(-(now - jobPostedAt) / (5 days))    → decays quickly
  geo       = 1.0 if remote or target country, else 0.1
  vectorBonus = score * 0.2 if vector score > 0.9
  relevanceBonus:
    = 1.0 → exact title match
    = 0.5 → title contains query
    = (matchCount / totalTokens) * 0.3 → partial token match
```

---

## 9. File Map

### Frontend Files

| File                                                                        | Purpose                                                |
| --------------------------------------------------------------------------- | ------------------------------------------------------ |
| `frontend/src/app/(app)/dashboard/search-jobs/components/searchJobPage.tsx` | Page component (renders `JobsPage`)                    |
| `frontend/src/components/jobs/JobPage.tsx`                                  | Main job list + detail layout, infinite scroll         |
| `frontend/src/components/jobs/SearchFilters.tsx`                            | Search bar + filter dropdowns (country, city, type)    |
| `frontend/src/components/jobs/job-card.tsx`                                 | Individual job card UI                                 |
| `frontend/src/components/jobs/JobDetail.tsx`                                | Single job detail panel                                |
| `frontend/src/components/jobs/FilterPills.tsx`                              | Active filter pills with remove button                 |
| `frontend/src/hooks/jobs/useJobs.tsx`                                       | **Central hook**: URL parsing, dispatch, pagination    |
| `frontend/src/redux/reducers/jobReducer.ts`                                 | Redux state: jobs, filters, pagination, loading, cache |
| `frontend/src/redux/sagas/jobSaga.ts`                                       | Sagas: searchJobsSaga, getRecommendJobsSaga            |
| `frontend/src/redux/types/jobType.ts`                                       | TypeScript interfaces: Job, Salary, Location, etc.     |
| `frontend/src/services/api/job.ts`                                          | API calls: searchJobs(), getRecommendJobs()            |
| `frontend/src/services/api.ts`                                              | Axios instance with base URL and interceptors          |
| `frontend/src/lib/jobCache.ts`                                              | In-memory TTL cache (5 min, 100 entries max)           |

### Backend Files

| File                                            | Purpose                                                             |
| ----------------------------------------------- | ------------------------------------------------------------------- |
| `backend/src/routes/job.route.js`               | Route: `GET /search` → `searchJobs`                                 |
| `backend/src/routes/student.route.js`           | Route: `GET /jobs/recommended` → `getProfileBasedRecommendedJobs`   |
| `backend/src/controllers/job.controller.js`     | `searchJobs()` controller                                           |
| `backend/src/controllers/student.controller.js` | `getProfileBasedRecommendedJobs()` controller                       |
| `backend/src/utils/jobHelpers.js`               | **Core utilities**: search, filter, rank, diversify, fetch external |
| `backend/src/utils/getRecommendedJobs.js`       | Alternative recommend path (used by agent/autopilot)                |
| `backend/src/utils/jobUtils.js`                 | `calculateMatchScore()`, `convertSalaryToYearly()`                  |
| `backend/src/models/jobs.model.js`              | Mongoose Job schema                                                 |
| `backend/src/models/jobInteraction.model.js`    | Mongoose JobInteraction schema (VIEW, SAVED, APPLIED, IMPRESSION)   |
| `backend/src/config/redis.js`                   | Redis client with `withCache()` helper                              |
| `backend/src/config/embedding.js`               | `generateEmbedding()` for vector search                             |

---

## 10. Sequence Diagrams

### Case 1: Recommend (Initial Load, No Filters)

```
User ─────────────────▸ /dashboard/search-jobs (no params)
  │
  ▼
useJobs() useEffect
  │ isEmpty = true
  │
  ├──▸ Pre-check cache: makeCacheKey('recommend', { page: 1 })
  │      └── HIT? → dispatch(setCacheHit(true))
  │
  ├──▸ dispatch(getRecommendJobsRequest({ page: 1, append: false }))
  │
  ▼
Redux Reducer
  │ loading = true (unless cacheHit)
  │
  ▼
Saga: getRecommendJobsSaga
  │
  ├── Build cache key
  ├── Cache check
  │    ├── HIT → dispatch success with cached data → DONE
  │    └── MISS ↓
  │
  ├──▸ GET /api/v1/students/jobs/recommended?page=1&limit=10
  │
  ▼
Backend: getProfileBasedRecommendedJobs
  │
  ├── buildUserProfileFromStudent → { titles, skills, location }
  ├── buildInteractionContext → { applied, saved, views }
  ├── retrieveLocalCandidates (keyword + vector search, Redis cached 600s)
  ├── applyFilters → rankJobs → diversify
  ├── Paginate (skip 0, limit 10)
  │
  ├── [If < 10 results] API FALLBACK:
  │    ├── fetchExternalJobs (JSearch × 3 pages, 12s timeout)
  │    ├── transformRapidApiJob → upsertExternalJobs
  │    └── processPool(formatted) → append
  │
  └──▸ Response: { jobs: [...], pagination: { currentPage: 1, hasNextPage: true } }

  ▼
Saga
  ├── setCache(key, data)
  └── dispatch(getRecommendJobsSuccess({ jobs, pagination }))

  ▼
Redux Reducer
  │ state.jobs = [...new jobs]
  │ state.loading = false
  │
  ▼
JobsPage renders job cards
```

### Case 2: Search (User Types "React Developer")

```
User types in SearchFilters ─────▸ "React Developer"
  │
  ▼
SearchFilters.pushFiltersToUrl({ query: 'React Developer' })
  │ router.push('?q=React+Developer')
  │
  ▼
useJobs() useEffect (searchParams changed)
  │ isEmpty = false (q has value)
  │
  ├──▸ dispatch(searchJobRequest({ query: 'React Developer', page: 1, ... }))
  │
  ▼
Saga: searchJobsSaga
  │
  ├── Cache check → MISS
  ├──▸ GET /api/v1/jobs/search?page=1&limit=10&q=React+Developer
  │
  ▼
Backend: searchJobs
  │
  ├── buildSearchContext → { query: 'react developer', filters: { country: 'IN' } }
  ├── retrieveLocalCandidates(context, 3200)
  │    ├── keywordSearch: regex 'react' AND 'developer' on title/tags (10-day window)
  │    └── vectorSearch: embedding('react developer') → $vectorSearch
  ├── processPool: filter → rank → diversify
  ├── Paginate (0-10)
  │
  ├── [Fallback if < 10]:
  │    ├── fetchExternalJobs('React Developer', 'IN', ...)
  │    ├── Transform → Upsert → Merge → Re-process
  │    └── Re-paginate
  │
  ├── Track impressions (JobInteraction)
  └──▸ Response

  ▼
Saga → setCache → dispatch(searchJobSuccess)
  ▼
Redux → state.jobs = [...search results]
  ▼
JobsPage renders filtered results
```

### Case 3: Infinite Scroll

```
User scrolls to bottom ─────▸ IntersectionObserver triggers
  │
  ▼
loadMoreJobs()
  │ hasNextPage = true, !loading
  │ currentPage = 1
  │
  ├── isSearchEmpty?
  │    ├── YES: dispatch(getRecommendJobsRequest({ page: 2, append: true }))
  │    └── NO:  dispatch(searchJobRequest({ ...filters, page: 2, append: true }))
  │
  ▼
Same backend flow, but page=2
  │
  ▼
Reducer (append: true):
  │ Deduplicates via Map keyed by _id
  │ state.jobs = [...existingJobs, ...newJobs] (deduped)
  │
  ▼
JobsPage renders additional cards below existing ones
```

---

## Summary of All Cases

| #   | Case                       | Decision Point               | Frontend Action                                        | Backend Endpoint                 | Auth    |
| --- | -------------------------- | ---------------------------- | ------------------------------------------------------ | -------------------------------- | ------- |
| 1   | **Recommend (initial)**    | All filters empty            | `getRecommendJobsRequest({ page: 1 })`                 | `GET /students/jobs/recommended` | ✅      |
| 2   | **Search (initial)**       | Any filter has value         | `searchJobRequest({ query, page: 1 })`                 | `GET /jobs/search`               | ❌      |
| 3   | **Filter change**          | User updates filter UI       | URL push → useEffect → dispatch                        | Same as 1 or 2                   | Depends |
| 4a  | **Pagination (recommend)** | Scroll + empty filters       | `getRecommendJobsRequest({ page: N+1, append: true })` | `GET /students/jobs/recommended` | ✅      |
| 4b  | **Pagination (search)**    | Scroll + has filters         | `searchJobRequest({ page: N+1, append: true })`        | `GET /jobs/search`               | ❌      |
| 5   | **Cache hit**              | Same request within 5 min    | Saga returns cached data, no API call                  | —                                | —       |
| 6   | **API fallback**           | Local DB has < limit results | Backend auto-fetches from RapidAPI JSearch             | Internal                         | —       |
