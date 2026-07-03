const fs = require('fs');
const path = require('path');

const reportPath = path.join(__dirname, 'screening_test_scan_report.json');

function main() {
  if (!fs.existsSync(reportPath)) {
    console.error('Report file not found. Running verify script first...');
    process.exit(1);
  }

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

  console.log('=== SCREENING TEST SCAN REPORT SUMMARY ===');
  console.log(`Total Checked:      ${report.matches.length + report.mismatches.length + report.privateOrSignIn.length + report.errors.length}`);
  console.log(`Matches:            ${report.matches.length}`);
  console.log(`Mismatches:         ${report.mismatches.length}`);
  console.log(`Private / Sign-in:  ${report.privateOrSignIn.length}`);
  console.log(`Errors / Timeouts:  ${report.errors.length}`);
  console.log('==========================================\n');

  if (report.mismatches.length > 0) {
    console.log('Mismatches (First 15):');
    console.log(JSON.stringify(report.mismatches.slice(0, 15), null, 2));
  } else {
    console.log('🎉 No mismatches found!');
  }

  process.exit(0);
}

main();
