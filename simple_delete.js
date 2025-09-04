const path = require('path');
const fs = require('fs');

// Simple script to delete Shawn Francis notes
console.log('🗑️ Deleting Shawn Francis notes...\n');

// Read the database.js file to get the database connection pattern
const dbPath = path.join(__dirname, 'voters.db');

if (!fs.existsSync(dbPath)) {
  console.error('❌ Database file not found:', dbPath);
  process.exit(1);
}

console.log('✅ Database file found');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(dbPath);

// First find Shawn Francis
db.get(`SELECT Unique_NC_Voter_Id, first_name, last_name, residence_street_name
        FROM voters
        WHERE LOWER(first_name) = 'shawn'
        AND LOWER(last_name) = 'francis'
        AND LOWER(residence_street_name) LIKE '%freedom%'`, (err, voter) => {
  if (err) {
    console.error('❌ Database error:', err.message);
    db.close();
    return;
  }

  if (!voter) {
    console.log('❌ Shawn Francis not found on Freedom Drive');
    db.close();
    return;
  }

  console.log('✅ Found Shawn Francis:');
  console.log(`- Name: ${voter.first_name} ${voter.last_name}`);
  console.log(`- Address: ${voter.residence_street_name}`);
  console.log(`- NCID: ${voter.Unique_NC_Voter_Id}`);
  console.log('');

  // Check current notes
  db.all('SELECT note, created_at FROM voter_notes WHERE unique_nc_voter_id = ?', [voter.Unique_NC_Voter_Id], (err, notes) => {
    if (err) {
      console.error('❌ Error checking notes:', err.message);
      db.close();
      return;
    }

    console.log(`📝 Found ${notes.length} notes for Shawn Francis`);

    if (notes.length > 0) {
      console.log('Current notes:');
      notes.forEach((note, index) => {
        console.log(`${index + 1}. "${note.note}" (${note.created_at})`);
      });

      // Delete all notes
      console.log('\n🗑️ Deleting all notes...');
      db.run('DELETE FROM voter_notes WHERE unique_nc_voter_id = ?', [voter.Unique_NC_Voter_Id], function(err) {
        if (err) {
          console.error('❌ Error deleting notes:', err.message);
        } else {
          console.log(`✅ Successfully deleted ${this.changes} notes for Shawn Francis`);
        }
        db.close();
      });
    } else {
      console.log('ℹ️ No notes to delete');
      db.close();
    }
  });
});
