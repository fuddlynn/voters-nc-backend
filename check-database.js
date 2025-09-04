const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

console.log('🔍 Checking Database Structure...\n');

// Check if database file exists
const dbPath = './voters.db';
if (!fs.existsSync(dbPath)) {
  console.log('❌ Database file does not exist!');
  console.log('Expected location:', dbPath);
  process.exit(1);
}

console.log('✅ Database file exists');
console.log('File size:', fs.statSync(dbPath).size, 'bytes\n');

const db = new sqlite3.Database(dbPath);

// Check what tables exist
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('❌ Error reading database:', err.message);
    return;
  }

  console.log('=== TABLES IN DATABASE ===');
  if (tables.length === 0) {
    console.log('❌ No tables found in database!');
    console.log('\nThis means the database needs to be initialized.');
    console.log('Run the data import scripts to populate the database.');
  } else {
    tables.forEach(table => {
      console.log(`✅ Table: ${table.name}`);
    });

    // Check voters table structure if it exists
    if (tables.some(t => t.name === 'voters')) {
      console.log('\n=== VOTERS TABLE STRUCTURE ===');
      db.all("PRAGMA table_info(voters)", (err, columns) => {
        if (err) {
          console.error('❌ Error reading voters table:', err.message);
        } else {
          columns.forEach(col => {
            console.log(`- ${col.name} (${col.type})`);
          });

          // Check how many voters exist
          db.get("SELECT COUNT(*) as count FROM voters", (err, result) => {
            if (err) {
              console.error('❌ Error counting voters:', err.message);
            } else {
              console.log(`\n✅ Voters in database: ${result.count}`);
            }
            db.close();
          });
        }
      });
    }
  }
});
