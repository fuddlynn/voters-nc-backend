const fs = require('fs');
const path = require('path');

const ncid = 'AA189491';
const filePath = 'C:\\sf\\cursor\\voter_data\\voter_history__1_ncvhis1_001.sql';

console.log(`🔍 Searching for NCID: ${ncid} in ${path.basename(filePath)}\n`);

try {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  let matches = [];
  let lineNumber = 0;

  for (const line of lines) {
    lineNumber++;
    if (line.includes(ncid)) {
      matches.push({
        lineNumber,
        line: line.trim()
      });
    }
  }

  console.log(`✅ Found ${matches.length} matching records for ${ncid}:\n`);

  matches.forEach((match, index) => {
    console.log(`${index + 1}. Line ${match.lineNumber}: ${match.line.substring(0, 150)}...`);
  });

  // Also check the second file
  const filePath2 = 'C:\\sf\\cursor\\voter_data\\voter_history__1_ncvhis1_002.sql';
  console.log(`\n🔍 Checking ${path.basename(filePath2)}...`);

  const content2 = fs.readFileSync(filePath2, 'utf8');
  const lines2 = content2.split('\n');

  let matches2 = [];
  let lineNumber2 = 0;

  for (const line of lines2) {
    lineNumber2++;
    if (line.includes(ncid)) {
      matches2.push({
        lineNumber: lineNumber2,
        line: line.trim()
      });
    }
  }

  console.log(`✅ Found ${matches2.length} matching records for ${ncid} in second file:\n`);

  matches2.forEach((match, index) => {
    console.log(`${index + 1}. Line ${match.lineNumber}: ${match.line.substring(0, 150)}...`);
  });

  console.log(`\n📊 Total: ${matches.length + matches2.length} records found for ${ncid}`);

} catch (error) {
  console.error('❌ Error reading file:', error);
}
