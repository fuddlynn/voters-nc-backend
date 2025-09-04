const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./voters.db');

const fs = require('fs');
const outputFile = 'delete_results.txt';

console.log('🗑️ Executing SQL to delete Shawn Francis notes...\n');

// Clear the output file
fs.writeFileSync(outputFile, '🗑️ Executing SQL to delete Shawn Francis notes...\n\n');

// Execute the deletion in one go
const deleteQuery = `
DELETE FROM voter_notes
WHERE unique_nc_voter_id IN (
    SELECT v.Unique_NC_Voter_Id
    FROM voters v
    WHERE LOWER(v.first_name) = 'shawn'
    AND LOWER(v.last_name) = 'francis'
    AND LOWER(v.residence_street_name) LIKE '%freedom%'
);
`;

db.run(deleteQuery, function(err) {
  let logMessage = '';

  if (err) {
    logMessage = '❌ Error deleting notes: ' + err.message + '\n';
    fs.appendFileSync(outputFile, logMessage);
    console.error(logMessage.trim());
    db.close();
    return;
  }

  logMessage = `✅ Successfully deleted ${this.changes} notes for Shawn Francis\n\n`;
  fs.appendFileSync(outputFile, logMessage);
  console.log(logMessage.trim());

  // Verify deletion
  const verifyQuery = `
  SELECT COUNT(*) as remaining_notes
  FROM voter_notes
  WHERE unique_nc_voter_id IN (
      SELECT v.Unique_NC_Voter_Id
      FROM voters v
      WHERE LOWER(v.first_name) = 'shawn'
      AND LOWER(v.last_name) = 'francis'
      AND LOWER(v.residence_street_name) LIKE '%freedom%'
  );
  `;

  db.get(verifyQuery, (err, result) => {
    if (err) {
      logMessage = '❌ Error verifying deletion: ' + err.message + '\n';
    } else {
      logMessage = `📊 Verification: ${result.remaining_notes} notes remaining\n`;
      if (result.remaining_notes === 0) {
        logMessage += '🎉 All notes successfully deleted!\n';
      }
    }

    fs.appendFileSync(outputFile, logMessage);
    console.log(logMessage.trim());
    db.close();
  });
});
