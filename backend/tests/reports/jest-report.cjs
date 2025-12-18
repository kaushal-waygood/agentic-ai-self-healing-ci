const fs = require('fs');
const path = require('path');

const now = new Date();
const timestamp = now
    .toISOString()
    .replace(/:/g, '-')
    .replace(/\..+/, '');

const outputDir = path.resolve(__dirname, '../output');
const sourceFile = path.join(outputDir, 'jest-report.html');
const targetFile = path.join(outputDir, `jest-report-${timestamp}.html`);

// Check if the source file exists
if (fs.existsSync(sourceFile)) {
    // Copy the file with timestamp
    fs.copyFileSync(sourceFile, targetFile);
    console.log(`✅ Jest HTML report saved: ${targetFile}`);
    console.log(`📊 Report location: tests/output/jest-report-${timestamp}.html`);
} else {
    console.error('❌ Jest report file not found:', sourceFile);
    process.exit(1);
}
