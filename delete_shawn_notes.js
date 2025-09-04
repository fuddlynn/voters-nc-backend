const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const db = new sqlite3.Database('./voters.db');

const logFile = './shawn_notes_log.txt';
let logContent = '🔍 Finding and deleting Shawn Francis notes...\n\n';

console.log('🔍 Finding and deleting Shawn Francis notes...\n');

// First, find Shawn Francis on Freedom Drive
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
    logContent += '❌ No Shawn Francis found on Freedom Drive\n';
    console.log('❌ No Shawn Francis found on Freedom Drive');

    // Check what Francis voters we have
    db.all(`SELECT first_name, last_name, residence_street_name, Unique_NC_Voter_Id
            FROM voters
            WHERE LOWER(last_name) = 'francis'
            ORDER BY first_name`, (err, francisVoters) => {
      if (err) {
        logContent += '❌ Error finding Francis voters: ' + err + '\n';
        console.error('❌ Error finding Francis voters:', err);
      } else {
        logContent += '\n📋 Francis voters found: ' + francisVoters.length + '\n';
        console.log('\n📋 Francis voters found:', francisVoters.length);
        francisVoters.forEach(v => {
          const line = `- ${v.first_name} ${v.last_name} on ${v.residence_street_name} (${v.Unique_NC_Voter_Id})\n`;
          logContent += line;
          console.log(line.trim());
        });
      }

      // Write log file and close
      fs.writeFileSync(logFile, logContent);
      db.close();
    });
    return;
  }

  const shawn = voters[0];
  console.log('✅ Found Shawn Francis:');
  console.log(`- Name: ${shawn.first_name} ${shawn.last_name}`);
  console.log(`- Address: ${shawn.residence_street_name}`);
  console.log(`- NCID: ${shawn.Unique_NC_Voter_Id}`);
  console.log('');

  logContent += '✅ Found Shawn Francis:\n';
  logContent += `- Name: ${shawn.first_name} ${shawn.last_name}\n`;
  logContent += `- Address: ${shawn.residence_street_name}\n`;
  logContent += `- NCID: ${shawn.Unique_NC_Voter_Id}\n\n`;

  // Check if he has any notes
  db.all('SELECT * FROM voter_notes WHERE unique_nc_voter_id = ?', [shawn.Unique_NC_Voter_Id], (err, notes) => {
    if (err) {
      console.error('❌ Error checking notes:', err);
      db.close();
      return;
    }

    logContent += `📝 Current notes for Shawn Francis: ${notes.length}\n`;
    console.log(`📝 Current notes for Shawn Francis: ${notes.length}`);

    if (notes.length > 0) {
      notes.forEach((note, index) => {
        const noteLine = `${index + 1}. "${note.note}" (${new Date(note.created_at).toLocaleString()})\n`;
        logContent += noteLine;
        console.log(noteLine.trim());
      });

      // Delete all notes
      logContent += '\n🗑️ Deleting all notes...\n';
      console.log('\n🗑️ Deleting all notes...');
      db.run('DELETE FROM voter_notes WHERE unique_nc_voter_id = ?', [shawn.Unique_NC_Voter_Id], function(err) {
        if (err) {
          const errorMsg = '❌ Error deleting notes: ' + err + '\n';
          logContent += errorMsg;
          console.error(errorMsg.trim());
        } else {
          const successMsg = `✅ Successfully deleted ${this.changes} notes for Shawn Francis\n`;
          logContent += successMsg;
          console.log(successMsg.trim());
        }

        // Write log file and close
        fs.writeFileSync(logFile, logContent);
        db.close();
      });
    } else {
      logContent += 'ℹ️ No notes found for Shawn Francis\n';
      console.log('ℹ️ No notes found for Shawn Francis');

      // Write log file and close
      fs.writeFileSync(logFile, logContent);
      db.close();
    }
  });
});
