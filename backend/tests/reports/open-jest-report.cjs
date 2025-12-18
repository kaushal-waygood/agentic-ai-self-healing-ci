const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const outputDir = path.resolve(__dirname, '../output');
const reportFile = path.join(outputDir, 'jest-report.html');

if (fs.existsSync(reportFile)) {
    const command = process.platform === 'win32'
        ? `start "" "${reportFile}"`
        : process.platform === 'darwin'
            ? `open "${reportFile}"`
            : `xdg-open "${reportFile}"`;

    exec(command, (error) => {
        if (error) {
            console.error('❌ Failed to open report:', error.message);
            console.log('📄 Please manually open:', reportFile);
        } else {
            console.log('✅ Opening Jest HTML report in browser...');
            console.log('📊 Report location:', reportFile);
        }
    });
} else {
    console.error('❌ Report file not found:', reportFile);
    console.log('💡 Run "npm run test:report" to generate a report first.');
}
