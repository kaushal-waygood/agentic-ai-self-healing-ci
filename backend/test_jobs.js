require('dotenv').config();
const mongoose = require('mongoose');
const { Job } = require('./src/models/jobs.model.js');
const { AgentFoundJob } = require('./src/models/AgentFoundJob.js');

async function test() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/zobsai');
  const count = await AgentFoundJob.countDocuments();
  console.log('Total found jobs:', count);
  process.exit(0);
}
test();
