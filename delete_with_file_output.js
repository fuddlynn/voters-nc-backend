const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const outputFile = 'delete_results.txt';

try {
  fs.writeFileSync(outputFile, 'Starting Shawn Francis note deletion...\n');

  const db = new sqlite3.Database('./voters.db');

  // Find Shawn Francis first
  db.get(`SELECT Unique_NC_Voter_Id, first_name, last_name, residence_street_name
          FROM voters
          WHERE LOWER(first_name) = 'shawn'
          AND LOWER(last_name) = 'francis'
          AND LOWER(residence_street_name) LIKE '%freedom%'`, (err, voter) => {

    if (err) {
      fs.appendFileSync(outputFile, 'Database error: ' + err.message + '\n');
      db.close();
      return;
    }

    if (!voter) {
      fs.appendFileSync(outputFile, 'Shawn Francis not found on Freedom Drive\n');

      // Check what Francis voters exist
      db.all(`SELECT first_name, last_name, residence_street_name, Unique_NC_Voter_Id
              FROM voters WHERE LOWER(last_name) = 'francis'`, (err, francis) => {
        if (!err && francis.length > 0) {
          fs.appendFileSync(outputFile, 'Francis voters found:\n');
          francis.forEach(v => {
            fs.appendFileSync(outputFile, `- ${v.first_name} ${v.last_name} on ${v.residence_street_name} (${v.Unique_NC_Voter_Id})\n`);
          });
        }
        db.close();
      });
      return;
    }

    fs.appendFileSync(outputFile, `Found Shawn Francis: ${voter.first_name} ${voter.last_name} on ${voter.residence_street_name}\n`);
    fs.appendFileSync(outputFile, `NCID: ${voter.Unique_NC_Voter_Id}\n\n`);

    // Check for existing notes
    db.all('SELECT note, created_at FROM voter_notes WHERE unique_nc_voter_id = ?', [voter.Unique_NC_Voter_Id], (err, notes) => {
      if (err) {
        fs.appendFileSync(outputFile, 'Error checking notes: ' + err.message + '\n');
        db.close();
        return;
      }

      fs.appendFileSync(outputFile, `Found ${notes.length} notes\n`);

      if (notes.length > 0) {
        fs.appendFileSync(outputFile, 'Notes to delete:\n');
        notes.forEach((note, index) => {
          fs.appendFileSync(outputFile, `${index + 1}. "${note.note}" (${note.created_at})\n`);
        });

        // Delete the notes
        fs.appendFileSync(outputFile, '\nDeleting notes...\n');
        db.run('DELETE FROM voter_notes WHERE unique_nc_voter_id = ?', [voter.Unique_NC_Voter_Id], function(err) {
          if (err) {
            fs.appendFileSync(outputFile, 'Error deleting notes: ' + err.message + '\n');
          } else {
            fs.appendFileSync(outputFile, `Successfully deleted ${this.changes} notes\n`);
          }
          db.close();
        });
      } else {
        fs.appendFileSync(outputFile, 'No notes to delete\n');
        db.close();
      }
    });
  });

} catch (error) {
  fs.writeFileSync(outputFile, 'Script error: ' + error.message + '\n');
}
