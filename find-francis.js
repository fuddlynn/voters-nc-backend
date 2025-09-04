const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./voters.db');

console.log('🔍 Searching for Shawn Francis and all Francis voters...\n');

console.log('=== ALL FRANCIS VOTERS ===');
db.all("SELECT first_name, last_name, residence_street_name, Unique_NC_Voter_Id FROM voters WHERE LOWER(last_name) = 'francis' ORDER BY first_name", (err, rows) => {
  if (err) {
    console.error('❌ Database error:', err.message);
    return;
  }

  if (rows.length === 0) {
    console.log('❌ No Francis voters found in database');
  } else {
    rows.forEach(row => {
      console.log(`👤 ${row.first_name} ${row.last_name} - ${row.residence_street_name} (${row.Unique_NC_Voter_Id})`);
    });
  }

  console.log('\n=== SHAWN SEARCH ===');
  db.all("SELECT first_name, last_name, residence_street_name, Unique_NC_Voter_Id FROM voters WHERE LOWER(first_name) = 'shawn'", (err, rows) => {
    if (err) {
      console.error('❌ Database error:', err.message);
    } else {
      if (rows.length === 0) {
        console.log('❌ No Shawn found in database');
      } else {
        rows.forEach(row => {
          console.log(`🎯 ${row.first_name} ${row.last_name} - ${row.residence_street_name} (${row.Unique_NC_Voter_Id})`);
        });
      }
    }

    console.log('\n=== FREEDOM DRIVE SEARCH ===');
    db.all("SELECT first_name, last_name, residence_street_name, Unique_NC_Voter_Id FROM voters WHERE LOWER(residence_street_name) LIKE '%freedom%'", (err, rows) => {
      if (err) {
        console.error('❌ Database error:', err.message);
      } else {
        if (rows.length === 0) {
          console.log('❌ No voters found on Freedom Drive');
        } else {
          rows.forEach(row => {
            console.log(`🏠 ${row.first_name} ${row.last_name} - ${row.residence_street_name} (${row.Unique_NC_Voter_Id})`);
          });
        }
      }
      db.close();
    });
  });
});
