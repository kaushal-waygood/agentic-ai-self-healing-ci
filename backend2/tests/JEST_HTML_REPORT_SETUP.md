# Jest HTML Report Setup - Complete! ✅

## What Was Configured

### 1. **Installed Package**
- `jest-html-reporter` - Generates beautiful HTML dashboards for Jest test results

### 2. **Configuration Added to package.json**

#### Jest Configuration:
```json
"reporters": [
  "default",
  [
    "jest-html-reporter",
    {
      "pageTitle": "Jest Test Report - ZobsAI Backend",
      "outputPath": "tests/output/jest-report.html",
      "includeFailureMsg": true,
      "includeConsoleLog": true,
      "theme": "darkTheme",
      "logo": "",
      "executionTimeWarningThreshold": 5,
      "dateFormat": "yyyy-mm-dd HH:MM:ss",
      "sort": "status",
      "includeObsoleteSnapshots": true
    }
  ]
],
"coverageDirectory": "tests/output/coverage"
```

#### New Script Added:
```json
"test:report": "jest --coverage && node tests/reports/jest-report.cjs"
```

### 3. **Files Created**

#### `tests/reports/jest-report.cjs`
Post-processing script that creates timestamped copies of the HTML report (similar to your k6 setup).

#### `tests/output/README.md`
Documentation for the test reports structure and usage.

### 4. **Updated .gitignore**
Added patterns to ignore generated reports:
```
tests/output/coverage/
tests/output/*.html
tests/output/*.json
```

## How to Use

### Generate Jest HTML Report (with timestamp)
```bash
npm run test:report
```

This will:
1. Run all Jest tests with coverage
2. Generate `tests/output/jest-report.html` (latest report)
3. Create a timestamped copy: `tests/output/jest-report-YYYY-MM-DDTHH-MM-SS.html`
4. Generate coverage reports in `tests/output/coverage/`

### Run Tests Without Report
```bash
npm test
```

This still generates the HTML report but doesn't create a timestamped copy.

### Watch Mode (Development)
```bash
npm run test:watch
```

## Report Features

The Jest HTML report includes:

✅ **Test Summary Dashboard**
- Total tests, passed, failed, pending
- Overall execution time
- Test suite breakdown

✅ **Detailed Test Results**
- Individual test status (✓ passed, ✗ failed)
- Execution time for each test
- Full error messages and stack traces for failures

✅ **Console Output**
- All console.log statements from tests
- Helpful for debugging

✅ **Dark Theme**
- Easy on the eyes for long review sessions

✅ **Sortable & Filterable**
- Sort by status, duration, or name
- Quick navigation to failed tests

✅ **Coverage Integration**
- Links to detailed coverage reports
- Coverage summary visible in the report

## File Structure

```
tests/
├── output/
│   ├── jest-report.html                          # Latest report (always)
│   ├── jest-report-2025-12-17T12-40-15.html     # Timestamped report
│   ├── genai-k6-report-2025-12-17T18-05-00.html # K6 reports
│   ├── genai-report.json                         # K6 raw data
│   ├── coverage/                                 # Coverage reports
│   │   ├── lcov-report/index.html               # HTML coverage
│   │   └── coverage-final.json                   # Raw coverage data
│   └── README.md                                 # Documentation
├── reports/
│   ├── jest-report.cjs                           # Jest report generator
│   └── genai-report.cjs                          # K6 report generator
└── api/
    └── [your test files]
```

## Comparison: Jest vs K6 Reports

| Feature | Jest HTML Report | K6 HTML Report |
|---------|------------------|----------------|
| **Purpose** | Unit/Integration Tests | Performance/Load Tests |
| **Output** | `jest-report-*.html` | `genai-k6-report-*.html` |
| **Command** | `npm run test:report` | `npm run k6:genai` |
| **Location** | `tests/output/` | `tests/output/` |
| **Theme** | Dark | Default |
| **Metrics** | Pass/Fail, Coverage | Response times, Throughput |

## Next Steps

1. **View the Report**: Open `tests/output/jest-report.html` in your browser
2. **Check Coverage**: Open `tests/output/coverage/lcov-report/index.html` for detailed coverage
3. **Integrate into CI/CD**: Use `npm run test:report` in your CI pipeline
4. **Archive Reports**: Timestamped reports are automatically created for historical tracking

## Example Output

After running `npm run test:report`, you'll see:
```
✅ Jest HTML report saved: D:\github\zobsai\backend\tests\output\jest-report-2025-12-17T12-40-15.html
📊 Report location: tests/output/jest-report-2025-12-17T12-40-15.html
```

Simply open the HTML file in any browser to view the interactive dashboard!

---

**Note**: The setup mirrors your k6 configuration for consistency across all test reporting.
