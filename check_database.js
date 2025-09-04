const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./voters.db');

console.log('🔍 Checking voter database...\n');

// Check total voter count
db.get('SELECT COUNT(*) as count FROM voters', [], (err, row) => {
  if (err) {
    console.error('❌ Error getting voter count:', err);
    return;
  }
  console.log('📊 Total voters in database:', row.count);

  // Check for Francis voters
  db.all('SELECT first_name, last_name, unique_nc_voter_id, election_count, is_village_election_voter FROM voters WHERE last_name LIKE "%Francis%" LIMIT 10', [], (err, francisVoters) => {
    if (err) {
      console.error('❌ Error finding Francis voters:', err);
      return;
    }

    console.log('\n👥 Francis voters found:', francisVoters.length);
    if (francisVoters.length > 0) {
      francisVoters.forEach((voter, i) => {
        console.log(`${i+1}. ${voter.first_name} ${voter.last_name} (NCID: ${voter.unique_nc_voter_id})`);
        console.log(`   - Elections: ${voter.election_count}`);
        console.log(`   - Village Voter: ${voter.is_village_election_voter ? 'YES' : 'NO'}\n`);
      });
    } else {
      console.log('❌ No Francis voters found in our 813 voter database');
      console.log('💡 This means Shawn Francis is not in our Village of Alamance voter file');
      console.log('💡 But he has voting records in the history files (12 elections, 3 municipal)');
    }

    // Check voting history count
    db.get('SELECT COUNT(*) as count FROM voting_history', [], (err, row) => {
      if (err) {
        console.error('❌ Error getting voting history count:', err);
        return;
      }
      console.log('\n🗳️ Total voting records in database:', row.count);

      // Check if AA189491 has voting records
      db.all('SELECT election_desc, election_lbl FROM voting_history WHERE unique_nc_voter_id = "AA189491" LIMIT 5', [], (err, records) => {
        if (err) {
          console.error('❌ Error getting AA189491 records:', err);
          return;
        }

        console.log('\n🎯 AA189491 voting records in database:', records.length);
        if (records.length > 0) {
          records.forEach((record, i) => {
            console.log(`${i+1}. ${record.election_desc} (${record.election_lbl})`);
          });
        }

        db.close();
      });
    });
  });
});
