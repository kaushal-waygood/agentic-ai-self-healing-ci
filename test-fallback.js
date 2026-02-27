import { MongoClient } from 'mongodb';

async function run() {
    const client = new MongoClient('mongodb://127.0.0.1:27017');
    await client.connect();
    const db = client.db('zobsai');
    
    const count = await db.collection('jobs').countDocuments({ title: { $regex: /Java Interns/i } });
    console.log(`Found ${count} jobs counting Java Interns`);
    
    const jobs = await db.collection('jobs').find({ title: { $regex: /Java Interns/i } }).toArray();
    jobs.forEach(j => console.log(j.jobId, String(j._id), j.title, j.company));
    
    client.close();
}
run();
