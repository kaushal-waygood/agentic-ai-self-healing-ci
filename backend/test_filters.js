import { applyFilters } from './src/utils/jobHelpers.js';

const mockContext = {
  filters: {
    country: 'IN',
    employmentType: 'Part-time',
  },
  interactions: {
    applied: new Set(),
    saved: new Set(),
    views: {},
  },
};

const mockJobs = [
  {
    _id: '1',
    isActive: true,
    jobTypes: ['PARTTIME'],
    country: 'IN',
    location: { city: 'Delhi', state: 'Delhi' },
    description: 'Looking for part time frontend dev in India',
  },
  {
    _id: '2',
    isActive: true,
    jobTypes: ['PART_TIME'],
    country: 'IN',
    location: { city: 'Delhi', state: 'Delhi' },
    description: 'Looking for part time dev in India',
  },
  {
    _id: '3',
    isActive: true,
    jobTypes: ['FULL_TIME'],
    country: 'IN',
    location: { city: 'Delhi', state: 'Delhi' },
    description: 'Looking for full time dev in India',
  },
];

const result = applyFilters(mockJobs, mockContext);
console.log('Input jobs:', mockJobs.length);
console.log('Filtered jobs length:', result.length);
console.log(
  'Filtered IDs:',
  result.map((j) => j._id),
);
