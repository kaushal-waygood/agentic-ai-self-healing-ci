import { applyFilters } from './src/utils/jobHelpers.js';

const mockJobs = [
  {
    _id: '1',
    isActive: true,
    jobTypes: ['FULL_TIME'],
    country: 'IN',
    location: { city: 'Delhi', state: 'Delhi' },
    description: 'India',
  },
  {
    _id: '2',
    isActive: true,
    jobTypes: ['PART-TIME'],
    country: 'IN',
    location: { city: 'Delhi', state: 'Delhi' },
    description: 'India',
  },
  {
    _id: '3',
    isActive: true,
    jobTypes: ['CONTRACT'],
    country: 'IN',
    location: { city: 'Delhi', state: 'Delhi' },
    description: 'India',
  },
  {
    _id: '4',
    isActive: true,
    jobTypes: ['INTERNSHIP'],
    country: 'IN',
    location: { city: 'Delhi', state: 'Delhi' },
    description: 'India',
  },
  {
    _id: '5',
    isActive: true,
    jobTypes: ['FREELANCE'],
    country: 'IN',
    location: { city: 'Delhi', state: 'Delhi' },
    description: 'India',
  },
];

const types = ['full-time', 'part-time', 'contract', 'internship', 'freelance'];

for (const type of types) {
  const result = applyFilters(mockJobs, {
    filters: { country: 'IN', employmentType: type },
  });
  console.log(
    `Filter by '${type}' returned:`,
    result.map((j) => j.jobTypes[0]),
  );
}

// Check with empty type
const resultAll = applyFilters(mockJobs, { filters: { country: 'IN' } });
console.log(`Filter by '(none)' returned:`, resultAll.length, 'jobs');
