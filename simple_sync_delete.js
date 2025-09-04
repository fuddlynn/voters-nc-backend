const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

console.log('🔍 Starting Shawn Francis notes deletion...\n');

try {
  // Open database
  const db = new sqlite3.Database('./voters.db');

  // Step 1: Find Shawn Francis
  db.all(`SELECT Unique_NC_Voter_Id, first_name, last_name, residence_street_name
          FROM voters
          WHERE LOWER(first_name) = 'shawn'
          AND LOWER(last_name) = 'francis'
          AND LOWER(residence_street_name) LIKE '%freedom%'`, (err, voters) => {

    if (err) {
      console.log('❌ Database error:', err.message);
      db.close();
      return;
    }

    if (voters.length === 0) {
      console.log('❌ No Shawn Francis found on Freedom Drive');

      // Check all Francis voters
      db.all(`SELECT first_name, last_name, residence_street_name
              FROM voters WHERE LOWER(last_name) = 'francis'`, (err, francis) => {
        console.log(`Found ${francis.length} Francis voters:`);
        francis.forEach(v => console.log(`- ${v.first_name} ${v.last_name} on ${v.residence_street_name}`));
        db.close();
      });
      return;
    }

    const shawn = voters[0];
    console.log(`✅ Found Shawn Francis: ${shawn.first_name} ${shawn.last_name}`);
    console.log(`📍 Address: ${shawn.residence_street_name}`);
    console.log(`🆔 NCID: ${shawn.Unique_NC_Voter_Id}\n`);

    // Step 2: Delete notes directly
    console.log('🗑️ Deleting Shawn Francis notes...');
    db.run('DELETE FROM voter_notes WHERE unique_nc_voter_id = ?', [shawn.Unique_NC_Voter_Id], function(err) {
      if (err) {
        console.log('❌ Error deleting notes:', err.message);
      } else {
        console.log(`✅ Successfully deleted ${this.changes} notes for Shawn Francis`);
      }
      db.close();
    });
  });

} catch (error) {
  console.log('❌ Script error:', error.message);
}
