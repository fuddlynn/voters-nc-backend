const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🗑️ Clearing All Voter Notes...\n');

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

// First, count existing notes
db.get("SELECT COUNT(*) as count FROM voter_notes", (err, result) => {
  if (err) {
    console.error('❌ Error counting notes:', err.message);
    db.close();
    return;
  }

  const noteCount = result.count;
  console.log(`📊 Found ${noteCount} notes in the database`);

  if (noteCount === 0) {
    console.log('ℹ️  No notes to delete - table is already empty');
    db.close();
    return;
  }

  // Clear all notes
  console.log('\n🗑️ Deleting all notes...');
  db.run("DELETE FROM voter_notes", (err) => {
    if (err) {
      console.error('❌ Error deleting notes:', err.message);
      db.close();
      return;
    }

    // Verify deletion
    db.get("SELECT COUNT(*) as count FROM voter_notes", (err, result) => {
      if (err) {
        console.error('❌ Error verifying deletion:', err.message);
      } else {
        console.log(`✅ Successfully deleted ${noteCount} notes`);
        console.log(`📊 Notes remaining: ${result.count}`);

        if (result.count === 0) {
          console.log('🎉 All notes have been cleared!');
          console.log('\nThis includes any notes for Shawn Francis on Freedom Drive.');
        } else {
          console.log('⚠️  Some notes may still remain');
        }
      }

      db.close();
      console.log('\n✅ Notes clearing operation complete!');
    });
  });
});
