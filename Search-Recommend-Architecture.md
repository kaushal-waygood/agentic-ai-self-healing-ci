# ZobsAI Search & Recommend Job Engine Architecture

## 1. System Overview

The ZobsAI Job Engine features a dual-pipeline architecture designed to deliver both **Search Results** (user-driven queries + filters) and **Recommendations** (profile-driven default suggestions). The system ensures low-latency responses via a 2-tier caching strategy while providing "infinite" scrolling capabilities through Progressive Filter Relaxation and a fallback to the external RapidAPI JSearch network.

## 2. Frontend Architecture

The frontend orchestrates the search experience primarily through the `/search-jobs` and `/dashboard/search-jobs` routes.

### `useJobs()` Hook (The Decision Engine)

- **Role**: This custom hook constantly monitors URL search parameters and is the central decision-maker.
- **Logic**:
  - If a user navigates to the page and the search parameters (`q, country, city, datePosted`, etc.) are entirely empty, it determines the user is looking for a default feed and dispatches a **Recommendation Request**.
  - If any search parameter has a value, it dispatches a **Search Request**.
  - It tracks active pagination and intercepts "Load More" intersection-observer events to append to the Redux state seamlessly.

### Frontend Local Cache (`lib/jobCache.ts`)

- **TTL**: 5 Minutes (300,000 ms).
- **Max Entries**: 100 max cached objects (LRU-like pruning).
- **Role**: `useJobs()` pre-checks this deterministic, JSON-stringified Map. If a key (e.g., `search:{"city":"Mumbai","query":"react"}`) exists, it bypasses the Redux saga API call entirely to prevent loading-spinner flashing, giving an instant UI response when a user hits "Back" or toggles identical filters.

## 3. Backend Processing & Data Retrieval Pipeline

The backend (`jobHelpers.js`) serves both controllers (`job.controller.js` and `student.controller.js`) using a unified data processing flow.

### Data Sources

1. **Local MongoDB (ZobsAI DB)**: The primary source of truth. Contains active jobs posted manually or synced previously from external APIs.
2. **External Fallback (RapidAPI JSearch)**: Activated only when local data pools are exhausted.

### Retrieval Strategy (`retrieveLocalCandidates`)

- **Redis Cache Layer**: Binds to a 10-minute (600s) TTL keyed by the hashed query and location context. Mitigates database-level DDOS under heavy simultaneous loads (e.g., an email blast driving 1,000 users to search for "React").
- **Concurrent DB Searching**:
  - **Vector Search**: Queries the MongoDB Atlas `$vectorSearch` index using an embedding Hash. Limits to documents with a score `>= 0.935`.
  - **Text/Keyword Search**: Standard MongoDB regex running against `title`, `queries`, `tags`, and `company` fields.
- **Combination**: Both lists are merged, sorted by `jobPostedAt`, and scrubbed of duplicates via `dedupeByTitleCompany`.

## 4. Ranking and Filtering Algorithms

Once the local candidate pool is retrieved, all jobs traverse the strict sequential array processor:

### Filter Stage (`applyFilters`)

1. Drops `isActive: false` jobs.
2. **Interaction Guard**: Drops jobs the user has already **Applied** to or **Saved**.
3. **Anti-Spam Guard**: Drops jobs the user has **Viewed > 5 times** (calculated using an exponential time-decay formula to weigh recent views heavier than older ones).
4. **Geo Guard**: Validates that remote restrictions, city strings, and state strings accurately align with the query context. Drops geographic misalignments.

### Ranking Stage (`rankJobs`)

A quantitative float score dictates sorting order:
`rankScore = (freshness * 0.6) + (geo * 0.4) + vectorBonus + relevanceBonus`

- **Freshness**: Exponential decay over 5 days `exp(-(now - jobPostedAt) / (5 days))`.
- **Relevance**: Full points for exact title matches, partial points for percentage-based token hits.

### Formatting Stage (`diversify` & Paginate)

Caps the final array to an absolute maximum of **3 jobs per Company name** to prevent massive organizations from completely consuming the first page of results.

## 5. Progressive Filter Relaxation

A safety net designed to prevent "Empty States" or "Pool Starvation" when a user searches for an overly hyper-specific location. For instance, searching specifically in a tiny town.

The Controller iterates through strictness tiers dynamically until the requested pagination `limit` (e.g., 10 results) is fulfilled:

- **Level 0**: Strict City + State + Country
- **Level 1**: Strict State + Country (City dropped)
- **Level 2**: Strict Country Only (State dropped)
- **Level 3**: Global / Remote fallback (Country dropped)

Each level checks both the Local Database and, if needed, triggers the RapidAPI fallback integration.

## 6. RapidAPI JSearch Integration Strategy

If the Local Pool cannot fill the pagination `limit` requested by the frontend, the Backend silently bridges to the JSearch API.

- **Timeout Guard**: Wrapped in a `Promise.race()` with an 8–12 second timeout constraint.
- **Concurrency**: Fetches 3 pages concurrently to rapidly build a usable cache in a single user hit.
- **Transformation (`transformRapidApiJob`)**: Normalizes disparate locations and dates into the strict ZobsAI `Job` schema.
- **Optimized Upsertion**:
  - To maintain maximum speed, AI Vector Embeddings are **NOT generated during this transaction**.
  - The job is injected into MongoDB using an optimized `$bulkWrite` with `needsEmbedding: true`. This allows a background CRON/Worker to generate embeddings later asynchronously without blocking the user's active HTTP request.
  - Generates tracking `slugs` and `_ids` immediately so the frontend can route to `/job/[slug]` without throwing 404 errors.

## 7. Exception Cases & Fallbacks

- **Missing Search Filters**: Hooks bypass normal search engines and hit the Recommendation route, triggering the backend to construct a pseudo-query utilizing the student's personal skills and titles (`profileQuery`).
- **Invalid Location Matching**: The `normalizeCountryCode` acts as a fail-safe against external API data anomalies, converting full names ("United States of America") and ISO-3 ("USA") into required ISO-2 ("US") codes to prevent database fragmentation.
- **External API Timeout / Gateway Error**: If RapidAPI takes > 8 seconds or returns a 5XX error, the system silently catches the exception, terminates the external call, and defaults to returning the fully-processed local candidates, ensuring the UI never crashes for the end user.

---

## 8. High-Level Flow Chart

```mermaid
flowchart TD
    classDef frontend fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef backend fill:#fff3e0,stroke:#e65100,stroke-width:2px;
    classDef localdb fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px;
    classDef external fill:#fce4ec,stroke:#880e4f,stroke-width:2px;
    classDef exception fill:#ffebee,stroke:#b71c1c,stroke-width:2px,color:#b71c1c;

    subgraph Frontend[Frontend Client (Next.js / Redux)]
        U([User]) -->|Visit /dashboard/search-jobs| UJ[useJobs Hook]
        U -->|Apply Filters UI| UJ
        UJ -->|Check In-Memory Cache TTL 5min| F_CACHE{Frontend Cache}

        %% Cache Exception
        F_CACHE -- Hit --> RES_FRONT[Render Jobs / Bypass Backend]
        F_CACHE -- Miss --> DECIDE{Filters Empty?}
    end

    subgraph Backend Routing (Express)
        DECIDE -- Yes -->|Case A: Empty Filters| B_REC[Recommend Route]
        DECIDE -- No --> B_SEARCH[Search Route]

        B_REC --> BU[Build User Profile Context: Skills/Titles/Preferences]
        B_SEARCH --> BS[Build Search Context: query/country/city]
    end

    subgraph Search Resolution Pipeline
        BU --> LP[Retrieve Local Candidates Pool]
        BS --> LP

        LP -->|Cache TTL 10min| R_CACHE{Redis Cache}
        R_CACHE -- Miss --> DB[(MongoDB ZobsAI)]

        DB -->|Text + Tags| REGEX[Keyword Regex Search]
        DB -->|Job Embedding| VEC[Atlas Vector Search score >= 0.935]
        REGEX & VEC --> COMBINE[Deduplicate Candidates]
    end

    subgraph Processing Pipeline & Guards
        COMBINE --> FLT[applyFilters: Location / State / Interactions]

        %% Exception Guards
        FLT -.->|Case G: Anti-Spam Guard| SG[Remove if Views > 5 without apply]
        FLT -.->|Exception: Invalid Location| LOC_G[normalizeCountryCode Check]
        FLT -.->|Exception: Duplicate State| AP_G[Filter Out Applied/Saved Jobs]

        FLT --> RANK[rankJobs: Score by freshness, geo, relevance, vectorBonus]
        RANK --> DIV[diversify: Cap at 3 max per company]
        DIV --> PAG[Paginate local pool limit]

        PAG --> CHK_SIZE{Is Result Length >= Limit?}
    end

    subgraph RapidAPI JSearch Fallback Pipeline
        %% Pool Starvation
        CHK_SIZE -- No -->|Case B: Pool Starvation Trigger| FALLBACK[Trigger API Fallback]

        %% Filter Relaxation
        FALLBACK -->|Case D: Progressive Relaxation| RELAX[Attempt Filter Relax: City -> State -> Country -> Global]
        RELAX --> FETCH_API[Fetch from RapidAPI JSearch 3 Pages Concurrent]

        %% API Timeout
        FETCH_API -.->|Case C: External API Timeout 8-12s/ Gateway Error| TIMEOUT[Graceful Degradation: Continue strictly with valid local results]

        FETCH_API -- Success --> TRANS[transformRapidApiJob]
        TRANS --> UPSERT[upsertExternalJobs to MongoDB with needsEmbedding=true]
        UPSERT --> MERGE[Merge newly synced API results with Local Pool]
        MERGE --> |Re-Process through Filters & Ranking| FLT
    end

    %% Final Output
    CHK_SIZE -- Yes --> OUT[Return JSON Success: jobs + pagination details]
    TIMEOUT --> OUT
    OUT -->|Track Impression Async| IMP[JobInteraction Event Generation]
    OUT --> RES_FRONT

    class Frontend,UJ,F_CACHE,RES_FRONT,DECIDE frontend;
    class Backend Routing,B_REC,B_SEARCH,BU,BS backend;
    class Search Resolution Pipeline,LP,R_CACHE,DB,REGEX,VEC,COMBINE localdb;
    class RapidAPI JSearch Fallback Pipeline,FALLBACK,RELAX,FETCH_API,TRANS,UPSERT,MERGE external;
    class F_CACHE,DECIDE,SG,LOC_G,AP_G,CHK_SIZE,FALLBACK,RELAX,TIMEOUT exception;
```
