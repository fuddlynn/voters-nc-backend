const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./voters.db');

console.log('🔍 Finding Shawn Francis on Freedom Drive...\n');

// Find Shawn Francis on Freedom Drive
db.all(`SELECT v.Unique_NC_Voter_Id, v.first_name, v.last_name, v.residence_street_name
        FROM voters v
        WHERE LOWER(v.first_name) = 'shawn'
        AND LOWER(v.last_name) = 'francis'
        AND LOWER(v.residence_street_name) LIKE '%freedom%'`, (err, voters) => {
  if (err) {
    console.error('❌ Database error:', err);
    db.close();
    return;
  }

  if (voters.length === 0) {
    console.log('❌ No Shawn Francis found on Freedom Drive');

    // Let's see what Francis voters we have
    db.all(`SELECT first_name, last_name, residence_street_name
            FROM voters
            WHERE LOWER(last_name) = 'francis'
            ORDER BY first_name`, (err, francisVoters) => {
      if (err) {
        console.error('❌ Error finding Francis voters:', err);
      } else {
        console.log('\n📋 Francis voters found:', francisVoters.length);
        francisVoters.forEach(v => {
          console.log(`- ${v.first_name} ${v.last_name} on ${v.residence_street_name}`);
        });
      }
      db.close();
    });
    return;
  }

  console.log('✅ Found Shawn Francis:');
  voters.forEach(voter => {
    console.log(`- Name: ${voter.first_name} ${voter.last_name}`);
    console.log(`- Address: ${voter.residence_street_name}`);
    console.log(`- NCID: ${voter.Unique_NC_Voter_Id}`);
    console.log('');
  });

  db.close();
});
