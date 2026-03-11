# Unit Tests (No Database)

Tests in `tests/utils/`, `tests/worker/`, and `tests/unit/` run **without connecting to MongoDB**.

## Run unit tests only

```bash
npm run test:unit
```

## Two ways to write tests without DB

### 1. Pure unit tests (no mocks)

Test pure functions that don't import models or DB. Import only the function under test.

**Example:** `tests/utils/jobHelpers.test.js`

```javascript
import { applyFilters } from '../../src/utils/jobHelpers.js';

describe('applyFilters', () => {
  it('filters jobs correctly', () => {
    const result = applyFilters(mockJobs, mockContext);
    expect(result).toHaveLength(2);
  });
});
```

**Note:** If the source file imports mongoose/models, those modules load but won't connect unless you call `connectDB()`.

### 2. Mocked tests (mock DB modules)

When testing code that uses User, Student, etc., mock those modules so no real DB is used.

**Example:** `tests/worker/autopilotWorker.test.js`

```javascript
// Mock BEFORE importing the module under test
jest.mock('../../src/models/User.model.js', () => ({
  User: {
    findById: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
  },
}));

jest.mock('../../../src/config/db.js', () => ({
  default: jest.fn().mockResolvedValue(undefined),
  disconnectDB: jest.fn().mockResolvedValue(undefined),
}));

import { myFunction } from '../../src/controllers/someController.js';
import { User } from '../../src/models/User.model.js';

describe('myFunction', () => {
  it('calls User.findById', async () => {
    User.findById.mockResolvedValue({ _id: '123', email: 'test@test.com' });
    await myFunction('123');
    expect(User.findById).toHaveBeenCalledWith('123');
  });
});
```

## Quick reference

| Script        | What it runs                          |
|---------------|----------------------------------------|
| `npm run test:unit` | `tests/utils`, `tests/worker`, `tests/unit` |
| `npm run test:api`  | `tests/api` (requires MongoDB)         |
| `npm run test`      | All tests                              |
