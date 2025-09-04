// Use the existing database functions to delete Shawn Francis notes
const { getAllStreets, getVotersByStreet, getVoterById, getVoterNotes, saveVoterNote } = require('./database');
const fs = require('fs');

async function deleteShawnNotes() {
  try {
    console.log('🔍 Searching for Shawn Francis...');

    // First, let's find Shawn Francis by searching all streets
    const streets = await getAllStreets();
    console.log(`Found ${streets.length} streets to search`);

    let shawnFound = null;

    // Search through each street for Shawn Francis
    for (const street of streets) {
      if (street.name.toLowerCase().includes('freedom')) {
        console.log(`Checking Freedom Drive...`);
        const voters = await getVotersByStreet(street.name);

        const shawn = voters.find(v =>
          v.first_name && v.first_name.toLowerCase() === 'shawn' &&
          v.last_name && v.last_name.toLowerCase() === 'francis'
        );

        if (shawn) {
          shawnFound = shawn;
          console.log(`✅ Found Shawn Francis: ${shawn.first_name} ${shawn.last_name}`);
          console.log(`📍 Address: ${shawn.residence_house_number} ${street.name}`);
          console.log(`🆔 NCID: ${shawn.Unique_NC_Voter_Id}`);
          break;
        }
      }
    }

    if (!shawnFound) {
      console.log('❌ Shawn Francis not found on Freedom Drive');

      // Let's check what Francis voters we have
      console.log('\nSearching for all Francis voters...');
      for (const street of streets.slice(0, 5)) { // Check first 5 streets
        const voters = await getVotersByStreet(street.name);
        const francisVoters = voters.filter(v =>
          v.last_name && v.last_name.toLowerCase() === 'francis'
        );

        if (francisVoters.length > 0) {
          console.log(`Francis voters on ${street.name}:`);
          francisVoters.forEach(v => {
            console.log(`- ${v.first_name} ${v.last_name} (${v.Unique_NC_Voter_Id})`);
          });
        }
      }
      return;
    }

    // Check if Shawn has any notes
    const notes = await getVoterNotes(shawnFound.Unique_NC_Voter_Id);
    console.log(`\n📝 Shawn Francis has ${notes.length} notes`);

    if (notes.length === 0) {
      console.log('ℹ️ No notes to delete');
      return;
    }

    // Show current notes
    console.log('\n📋 Current notes:');
    notes.forEach((note, index) => {
      console.log(`${index + 1}. "${note.note}" (${new Date(note.timestamp).toLocaleString()})`);
    });

    console.log('\n🗑️ Deleting all notes...');

    // For deletion, we'll need to use raw SQL since the existing functions don't have a delete function
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./voters.db');

    db.run('DELETE FROM voter_notes WHERE unique_nc_voter_id = ?', [shawnFound.Unique_NC_Voter_Id], function(err) {
      if (err) {
        console.error('❌ Error deleting notes:', err);
      } else {
        console.log(`✅ Successfully deleted ${this.changes} notes for Shawn Francis`);
      }
      db.close();
    });

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

deleteShawnNotes();
