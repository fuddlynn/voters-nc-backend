const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🧪 Testing Database Connection...\n');

// Test the exact same database path used by find-francis.js
const dbPath = path.join(__dirname, 'voters.db');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to connect to database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database successfully');
});

// Check what tables exist
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('❌ Error reading database:', err.message);
    db.close();
    return;
  }

  console.log('\n=== TABLES IN DATABASE ===');
  if (tables.length === 0) {
    console.log('❌ No tables found!');
    console.log('\n🔧 SOLUTION: Run the import script first:');
    console.log('   import-voter-data.bat');
    db.close();
    return;
  }

  tables.forEach(table => {
    console.log(`✅ Table: ${table.name}`);
  });

  // Test the voters table specifically
  if (tables.some(t => t.name === 'voters')) {
    console.log('\n=== TESTING VOTERS TABLE ===');

    // Count total voters
    db.get("SELECT COUNT(*) as count FROM voters", (err, result) => {
      if (err) {
        console.error('❌ Error counting voters:', err.message);
      } else {
        console.log(`✅ Total voters: ${result.count}`);

        if (result.count === 0) {
          console.log('⚠️  Voters table exists but is empty!');
          console.log('   Run: import-voter-data.bat');
        } else {
          console.log('🎉 Database is populated and ready!');
        }
      }

      // Test Shawn Francis search
      console.log('\n=== TESTING SHAWN FRANCIS SEARCH ===');
      db.all("SELECT first_name, last_name, residence_street_name, Unique_NC_Voter_Id FROM voters WHERE LOWER(last_name) = 'francis'", (err, rows) => {
        if (err) {
          console.error('❌ Error searching Francis voters:', err.message);
        } else {
          console.log(`Found ${rows.length} Francis voters:`);
          rows.forEach(row => {
            console.log(`  👤 ${row.first_name} ${row.last_name} - ${row.residence_street_name}`);
          });

          if (rows.length === 0) {
            console.log('❌ No Francis voters found - database not populated');
          }
        }

        db.close();
        console.log('\n✅ Database test complete!');
      });
    });
  } else {
    console.log('\n❌ Voters table does not exist!');
    console.log('   Run: import-voter-data.bat');
    db.close();
  }
});
