const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./voters.db');

console.log('🔍 Checking Shawn Francis election data...\n');

// First find Shawn Francis
db.get('SELECT * FROM voters WHERE first_name = ? AND last_name = ?', ['Shawn', 'Francis'], (err, voter) => {
  if (err) {
    console.error('❌ Database error:', err);
    return;
  }

  if (!voter) {
    console.log('❌ Shawn Francis not found in voters table');

    // Let's see what Francis voters we do have
    db.all('SELECT first_name, last_name, residence_street_name FROM voters WHERE last_name = "Francis" LIMIT 10', [], (err, francisVoters) => {
      console.log('Francis voters found:', francisVoters.length);
      francisVoters.forEach(v => console.log('- ' + v.first_name + ' ' + v.last_name + ' on ' + v.residence_street_name));
      db.close();
    });
    return;
  }

  console.log('👤 Voter Details:');
  console.log('Name:', voter.first_name, voter.last_name);
  console.log('Address:', voter.residence_house_number, voter.residence_street_name);
  console.log('NCID:', voter.unique_nc_voter_id);
  console.log('Election Count:', voter.election_count);
  console.log('Village Voter:', voter.is_village_election_voter ? 'YES' : 'NO');
  console.log();

  // Now check their voting history
  db.all('SELECT election_desc, election_lbl FROM voting_history WHERE unique_nc_voter_id = ? ORDER BY election_lbl',
    [voter.unique_nc_voter_id], (err, history) => {
      if (err) {
        console.error('❌ Error getting history:', err);
        db.close();
        return;
      }

      console.log('🗳️ Voting History (' + history.length + ' elections):');
      history.forEach((record, index) => {
        console.log((index + 1) + '. ' + record.election_desc);
      });

      console.log('\n🏛️ Municipal Elections:');
      const municipalElections = history.filter(record =>
        record.election_desc && record.election_desc.toUpperCase().includes('MUNICIPAL')
      );
      municipalElections.forEach((record, index) => {
        console.log((index + 1) + '. ' + record.election_desc);
      });

      db.close();
    });
});
