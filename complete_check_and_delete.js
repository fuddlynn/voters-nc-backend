const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('./voters.db');
const logFile = 'complete_operation_log.txt';

// Clear log file
fs.writeFileSync(logFile, '=== Shawn Francis Notes Deletion Operation ===\n\n');

function log(message) {
  console.log(message);
  fs.appendFileSync(logFile, message + '\n');
}

log('🔍 Starting complete check and delete operation...\n');

// Step 1: Check all Francis voters
log('Step 1: Finding all Francis voters...');
db.all(`SELECT first_name, last_name, residence_street_name, Unique_NC_Voter_Id
        FROM voters
        WHERE LOWER(last_name) = 'francis'
        ORDER BY first_name`, (err, francisVoters) => {
  if (err) {
    log('❌ Error finding Francis voters: ' + err.message);
    db.close();
    return;
  }

  log(`Found ${francisVoters.length} Francis voters:`);
  francisVoters.forEach(v => {
    log(`  - ${v.first_name} ${v.last_name} on ${v.residence_street_name} (${v.Unique_NC_Voter_Id})`);
  });
  log('');

  // Step 2: Check specifically for Shawn Francis
  log('Step 2: Looking for Shawn Francis specifically...');
  const shawn = francisVoters.find(v =>
    v.first_name && v.first_name.toLowerCase() === 'shawn'
  );

  if (!shawn) {
    log('❌ No Shawn Francis found in database');
    log('\n🔍 Searching more broadly for Shawn...');

    // Check if Shawn exists with any last name
    db.all(`SELECT first_name, last_name, residence_street_name, Unique_NC_Voter_Id
            FROM voters
            WHERE LOWER(first_name) = 'shawn'`, (err, shawnVoters) => {
      if (err) {
        log('❌ Error finding Shawn voters: ' + err.message);
      } else {
        log(`Found ${shawnVoters.length} Shawn voters:`);
        shawnVoters.forEach(v => {
          log(`  - ${v.first_name} ${v.last_name} on ${v.residence_street_name} (${v.Unique_NC_Voter_Id})`);
        });
      }
      db.close();
    });
    return;
  }

  log(`✅ Found Shawn Francis: ${shawn.first_name} ${shawn.last_name}`);
  log(`📍 Address: ${shawn.residence_street_name}`);
  log(`🆔 NCID: ${shawn.Unique_NC_Voter_Id}`);
  log('');

  // Step 3: Check Shawn's notes
  log('Step 3: Checking Shawn Francis notes...');
  db.all('SELECT note, created_at FROM voter_notes WHERE unique_nc_voter_id = ?',
    [shawn.Unique_NC_Voter_Id], (err, notes) => {
    if (err) {
      log('❌ Error checking notes: ' + err.message);
      db.close();
      return;
    }

    log(`📝 Shawn Francis has ${notes.length} notes:`);

    if (notes.length > 0) {
      notes.forEach((note, index) => {
        log(`  ${index + 1}. "${note.note}" (${note.created_at})`);
      });

      // Step 4: Delete all notes
      log('\nStep 4: Deleting all notes...');
      db.run('DELETE FROM voter_notes WHERE unique_nc_voter_id = ?',
        [shawn.Unique_NC_Voter_Id], function(err) {
        if (err) {
          log('❌ Error deleting notes: ' + err.message);
        } else {
          log(`✅ Successfully deleted ${this.changes} notes`);
        }

        // Step 5: Verify deletion
        log('\nStep 5: Verifying deletion...');
        db.all('SELECT COUNT(*) as count FROM voter_notes WHERE unique_nc_voter_id = ?',
          [shawn.Unique_NC_Voter_Id], (err, result) => {
          if (err) {
            log('❌ Error verifying deletion: ' + err.message);
          } else {
            const remaining = result[0].count;
            log(`📊 Notes remaining for Shawn Francis: ${remaining}`);
            if (remaining === 0) {
              log('🎉 SUCCESS: All notes deleted!');
            } else {
              log('⚠️ WARNING: Some notes may still remain');
            }
          }

          log('\n=== Operation Complete ===');
          db.close();
        });
      });
    } else {
      log('ℹ️ No notes found to delete');
      log('\n=== Operation Complete ===');
      db.close();
    }
  });
});
