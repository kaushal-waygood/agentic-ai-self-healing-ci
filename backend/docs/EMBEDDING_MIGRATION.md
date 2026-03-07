# Embedding Model: BGESmallENV15 (384 dims)

The job search uses **BGESmallENV15** for semantic vector search—~3x lighter than BGEBaseEN (~133MB vs ~438MB).

## MongoDB Atlas Vector Index

The `$vectorSearch` requires a vector index on `job_embedding`. After switching models, update the index:

1. **Atlas UI** → Database → Browse Collections → `jobs`
2. **Indexes** tab → Create Index (or edit existing `vector_index`)
3. Use **384 dimensions** (BGESmallENV15 output):

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "job_embedding",
      "numDimensions": 384,
      "similarity": "cosine"
    }
  ]
}
```

4. If migrating from 768-dim: create the new index, run re-embed script, then drop the old index.

## Re-embedding Jobs (Migration)

After changing the model or index dimensions:

```bash
cd backend
npm run reembed:jobs
```

This re-generates embeddings for all active jobs and updates `job_embedding`.
