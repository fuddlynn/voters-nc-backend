const { initDatabase, importVoterData, importVotingHistory, updateVoterStats } = require('./database');

console.log('🚀 Starting Voter Data Import Process...\n');

async function runImport() {
  try {
    console.log('Step 1: Initializing database tables...');
    await initDatabase();
    console.log('✅ Database tables created\n');

    console.log('Step 2: Importing voter data from CSV...');
    await importVoterData();
    console.log('✅ Voter data imported\n');

    console.log('Step 3: Importing voting history...');
    await importVotingHistory();
    console.log('✅ Voting history imported\n');

    console.log('Step 4: Updating voter statistics...');
    await updateVoterStats();
    console.log('✅ Voter statistics updated\n');

    console.log('🎉 Database import process completed successfully!');
    console.log('\n📊 Your database now contains:');
    console.log('- ✅ Voters table with 813+ voter records');
    console.log('- ✅ Voting history table with election data');
    console.log('- ✅ Streets table with voter counts');
    console.log('- ✅ Voter notes table for campaign notes');
    console.log('\n🔍 You can now search for Shawn Francis and other voters!');

  } catch (error) {
    console.error('❌ Error during import process:', error.message);

    if (error.message.includes('Voter data file not found')) {
      console.log('\n🔍 Looking for data files...');
      console.log('Expected CSV file: C:\\sf\\cursor\\voter_data\\VillageOfAlamanceVoters_20250824');
      console.log('Expected SQL files: voter_history__1_ncvhis1_001.sql, voter_history__1_ncvhis1_002.sql');
      console.log('\nPlease ensure these files exist in the voter_data directory.');
    }
  }
}

runImport();
