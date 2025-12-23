// scripts/fix-slugs.js
import { MongoClient } from 'mongodb';

const MONGO_URI =
  'mongodb+srv://arsalan:n3nq9IZZJsOOC5Cl@careerpilot.zysihya.mongodb.net/careerpilot?retryWrites=true&w=majority&appName=careerpilot';
const DB_NAME = 'careerpilot';
const BATCH = 500; // number of docs to fetch per batch

function sanitizeSlug(slug) {
  if (!slug || typeof slug !== 'string') return slug;
  let s = slug.replace(/[^a-zA-Z0-9-]/g, '');
  s = s.replace(/-+/g, '-');
  s = s.replace(/^-+|-+$/g, '');
  return s;
}

(async () => {
  const client = new MongoClient(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const col = db.collection('jobs');

    const total = await col.countDocuments({});
    console.log(`Total docs: ${total}`);

    const cursor = col.find({}, { projection: { slug: 1 } });
    let updated = 0;
    const ops = [];
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      const newSlug = sanitizeSlug(doc.slug || '');
      if (newSlug !== (doc.slug || '')) {
        ops.push({
          updateOne: {
            filter: { _id: doc._id },
            update: { $set: { slug: newSlug } },
          },
        });
      }
      if (ops.length >= BATCH) {
        const res = await col.bulkWrite(ops, { ordered: false });
        updated += res.modifiedCount || 0;
        console.log(`Processed batch, updated so far: ${updated}`);
        ops.length = 0;
      }
    }
    if (ops.length) {
      const res = await col.bulkWrite(ops, { ordered: false });
      updated += res.modifiedCount || 0;
    }
    console.log(`Done. Total updated: ${updated}`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
})();
