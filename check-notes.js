const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('📝 Checking Voter Notes Table...\n');

// Use the same database path as other scripts
const dbPath = path.join(__dirname, 'voters.db');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to connect to database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database successfully');
});

// Check if voter_notes table exists
db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='voter_notes'", (err, tables) => {
  if (err) {
    console.error('❌ Error checking tables:', err.message);
    db.close();
    return;
  }

  if (tables.length === 0) {
    console.log('❌ voter_notes table does not exist!');
    console.log('\nThis means notes functionality hasn\'t been set up yet.');
    db.close();
    return;
  }

  console.log('✅ voter_notes table exists');

  // Count total notes
  db.get("SELECT COUNT(*) as count FROM voter_notes", (err, result) => {
    if (err) {
      console.error('❌ Error counting notes:', err.message);
    } else {
      console.log(`📊 Total notes in database: ${result.count}`);

      if (result.count === 0) {
        console.log('ℹ️  No notes found in the database');
        console.log('\nThis means Shawn Francis either:');
        console.log('- Has no notes yet');
        console.log('- Notes were already deleted');
        console.log('- Notes table is empty');
        db.close();
        return;
      }

      // Show sample of notes
      console.log('\n=== SAMPLE OF NOTES ===');
      db.all("SELECT unique_nc_voter_id, note, created_at FROM voter_notes LIMIT 5", (err, notes) => {
        if (err) {
          console.error('❌ Error reading notes:', err.message);
        } else {
          notes.forEach((note, index) => {
            console.log(`${index + 1}. Voter ${note.unique_nc_voter_id}: "${note.note.substring(0, 50)}${note.note.length > 50 ? '...' : ''}"`);
            console.log(`   Created: ${note.created_at}`);
          });
        }

        // Check for Shawn Francis specifically
        console.log('\n=== CHECKING FOR SHAWN FRANCIS NOTES ===');
        db.all("SELECT note, created_at FROM voter_notes WHERE unique_nc_voter_id IN (SELECT Unique_NC_Voter_Id FROM voters WHERE LOWER(first_name) = 'shawn' AND LOWER(last_name) = 'francis')", (err, shawnNotes) => {
          if (err) {
            console.error('❌ Error searching Shawn Francis notes:', err.message);
          } else {
            if (shawnNotes.length === 0) {
              console.log('❌ No notes found for Shawn Francis');
              console.log('\nThis means:');
              console.log('- Shawn Francis exists but has no notes');
              console.log('- Shawn Francis was not found in database');
              console.log('- Notes were already deleted');
            } else {
              console.log(`✅ Found ${shawnNotes.length} notes for Shawn Francis:`);
              shawnNotes.forEach((note, index) => {
                console.log(`${index + 1}. "${note.note}" (${note.created_at})`);
              });
            }
          }

          db.close();
          console.log('\n✅ Notes check complete!');
        });
      });
    }
  });
});
