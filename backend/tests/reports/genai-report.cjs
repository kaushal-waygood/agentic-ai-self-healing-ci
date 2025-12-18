const reporter = require('k6-html-reporter');
const path = require('path');
const fs = require('fs');

const now = new Date();
const timestamp = now
    .toISOString()
    .replace(/:/g, '-')
    .replace(/\..+/, '');

const outputDir = path.resolve(__dirname, '../output');
const jsonFile = path.join(outputDir, 'genai-report.json');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

reporter.generateSummaryReport({
    jsonFile,
    output: outputDir,
    reportName: `genai-k6-report-${timestamp}`,
});
