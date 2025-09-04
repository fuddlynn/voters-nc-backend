const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

// Database setup
const dbPath = path.join(__dirname, 'voters.db');
const dataDir = 'C:\\sf\\cursor\\voter_data';
const csvFile = path.join(dataDir, 'VillageOfAlamanceVoters_20250824');

// Create database connection
const db = new sqlite3.Database(dbPath);

// Initialize database tables
function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create voters table
      db.run(`
        CREATE TABLE IF NOT EXISTS voters (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          unique_nc_voter_id TEXT UNIQUE,
          last_name TEXT,
          first_name TEXT,
          middle_name TEXT,
          name_suffix TEXT,
          residence_house_number TEXT,
          residence_fractional_address TEXT,
          residence_apartment TEXT,
          residence_prestreet_direction TEXT,
          residence_street_name TEXT,
          residence_poststreet_direction TEXT,
          residence_city TEXT,
          residence_zip TEXT,
          residence_zip_plus_four TEXT,
          mailing_address_1 TEXT,
          mailing_address_2 TEXT,
          mailing_address_3 TEXT,
          mailing_address_4 TEXT,
          age INTEGER,
          gender TEXT,
          race_code TEXT,
          ethnicity_code TEXT,
          political_party TEXT,
          political_party_if_other TEXT,
          county_code TEXT,
          precinct_name TEXT,
          legislative_district TEXT,
          municipality_code TEXT,
          municipality_description TEXT,
          ward TEXT,
          congressional_district TEXT,
          senate_district TEXT,
          assembly_district TEXT,
          last_county_voted TEXT,
          last_registered_address TEXT,
          last_registered_name TEXT,
          county_voter_registration_number TEXT,
          application_date TEXT,
          application_source TEXT,
          identification_required_flag TEXT,
          identification_verification_requirement_met_flag TEXT,
          voter_status_code TEXT,
          status_reason_codes TEXT,
          election_count INTEGER DEFAULT 0,
          is_village_election_voter INTEGER DEFAULT 0
        )
      `, (err) => {
        if (err) {
          console.error('Error creating voters table:', err);
          reject(err);
          return;
        }
        console.log('✓ Voters table created');

        // Add columns if they don't exist (for existing databases)
        db.run(`
          ALTER TABLE voters ADD COLUMN election_count INTEGER DEFAULT 0
        `, (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            console.log('Note: election_count column may already exist');
          }
        });

        db.run(`
          ALTER TABLE voters ADD COLUMN is_village_election_voter INTEGER DEFAULT 0
        `, (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            console.log('Note: is_village_election_voter column may already exist');
          }
        });
      });

      // Create streets table
      db.run(`
        CREATE TABLE IF NOT EXISTS streets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE,
          voter_count INTEGER DEFAULT 0
        )
      `, (err) => {
        if (err) {
          console.error('Error creating streets table:', err);
          reject(err);
          return;
        }
        console.log('✓ Streets table created');
      });

      // Create voting_history table
      db.run(`
        CREATE TABLE IF NOT EXISTS voting_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          county_id TEXT,
          county_desc TEXT,
          voter_reg_num TEXT,
          election_lbl TEXT,
          election_desc TEXT,
          voting_method TEXT,
          voted_party_cd TEXT,
          voted_party_desc TEXT,
          pct_label TEXT,
          pct_description TEXT,
          unique_nc_voter_id TEXT,
          voted_county_id TEXT,
          voted_county_desc TEXT,
          vtd_label TEXT,
          vtd_description TEXT
        )
      `, (err) => {
        if (err) {
          console.error('Error creating voting_history table:', err);
          reject(err);
          return;
        }
        console.log('✓ Voting history table created');
      });

      // Create voter_notes table
      db.run(`
        CREATE TABLE IF NOT EXISTS voter_notes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          unique_nc_voter_id TEXT,
          note TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (unique_nc_voter_id) REFERENCES voters (unique_nc_voter_id)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating voter_notes table:', err);
          reject(err);
          return;
        }
        console.log('✓ Voter notes table created');
        resolve();
      });
    });
  });
}

// Import CSV data into database
function importVoterData() {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(csvFile)) {
      reject(new Error('Voter data file not found: ' + csvFile));
      return;
    }

    console.log('📊 Importing voter data from CSV...');
    const voters = [];
    let processed = 0;

    fs.createReadStream(csvFile)
      .pipe(csv({ quote: "'", escape: "'" }))
      .on('data', (data) => {
        // Clean up single quotes from field values
        const cleanedData = {};
        Object.keys(data).forEach(key => {
          cleanedData[key.trim()] = data[key].replace(/^'|'$/g, '');
        });

        voters.push(cleanedData);
        processed++;

        if (processed % 100 === 0) {
          console.log(`📈 Processed ${processed} records...`);
        }
      })
      .on('end', () => {
        console.log(`✅ Loaded ${voters.length} voter records from CSV`);

        // Insert voters into database
        const insertVoter = db.prepare(`
          INSERT OR REPLACE INTO voters (
            unique_nc_voter_id, last_name, first_name, middle_name, name_suffix,
            residence_house_number, residence_fractional_address, residence_apartment,
            residence_prestreet_direction, residence_street_name, residence_poststreet_direction,
            residence_city, residence_zip, residence_zip_plus_four,
            mailing_address_1, mailing_address_2, mailing_address_3, mailing_address_4,
            age, gender, race_code, ethnicity_code, political_party, political_party_if_other,
            county_code, precinct_name, legislative_district, municipality_code, municipality_description,
            ward, congressional_district, senate_district, assembly_district,
            last_county_voted, last_registered_address, last_registered_name,
            county_voter_registration_number, application_date, application_source,
            identification_required_flag, identification_verification_requirement_met_flag,
            voter_status_code, status_reason_codes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        let inserted = 0;
        voters.forEach((voter, index) => {
          insertVoter.run([
            voter.Unique_NC_Voter_Id || voter.unique_nc_voter_id,
            voter.last_name || voter.Last_Name,
            voter[' first_name'] || voter.first_name,
            voter[' middle_name'] || voter.middle_name,
            voter[' name_suffix'] || voter.name_suffix,
            voter[' residence_house_number'] || voter.residence_house_number,
            voter[' residence_fractional_address'] || voter.residence_fractional_address,
            voter[' residence_apartment'] || voter.residence_apartment,
            voter[' residence_prestreet_direction'] || voter.residence_prestreet_direction,
            voter[' residence_street_name'] || voter.residence_street_name,
            voter[' residence_poststreet_direction'] || voter.residence_poststreet_direction,
            voter[' residence_city'] || voter.residence_city,
            voter[' residence_zip'] || voter.residence_zip,
            voter[' residence_zip_plus_four'] || voter.residence_zip_plus_four,
            voter[' mailing_address_1'] || voter.mailing_address_1,
            voter[' mailing_address_2'] || voter.mailing_address_2,
            voter[' mailing_address_3'] || voter.mailing_address_3,
            voter[' mailing_address_4'] || voter.mailing_address_4,
            parseInt(voter[' age'] || voter.age) || null,
            voter[' gender'] || voter.gender,
            voter[' race_code'] || voter.race_code,
            voter[' ethnicity_code'] || voter.ethnicity_code,
            voter[' political_party'] || voter.political_party,
            voter[' political_party_if_other'] || voter.political_party_if_other,
            voter[' county_code'] || voter.county_code,
            voter[' precinct_name'] || voter.precinct_name,
            voter[' legislative_district'] || voter.legislative_district,
            voter[' municipality_code'] || voter.municipality_code,
            voter[' municipality_description'] || voter.municipality_description,
            voter[' ward'] || voter.ward,
            voter[' congressional_district'] || voter.congressional_district,
            voter[' senate_district'] || voter.senate_district,
            voter[' assembly_district'] || voter.assembly_district,
            voter[' last_county_voted'] || voter.last_county_voted,
            voter[' last_registered_address'] || voter.last_registered_address,
            voter[' last_registered_name'] || voter.last_registered_name,
            voter[' county_voter_registration_number'] || voter.county_voter_registration_number,
            voter[' application_date'] || voter.application_date,
            voter[' Application_Source'] || voter.application_source,
            voter[' Identification_Required_Flag'] || voter.identification_required_flag,
            voter[' Identification_Verification_Requirement_Met_Flag'] || voter.identification_verification_requirement_met_flag,
            voter[' Voter_Status_Code'] || voter.voter_status_code,
            voter[' Status_Reason_Codes'] || voter.status_reason_codes
          ], (err) => {
            if (err) {
              console.error('Error inserting voter:', err);
            } else {
              inserted++;
              if (inserted % 100 === 0) {
                console.log(`💾 Inserted ${inserted} voters into database...`);
              }
            }

            if (index === voters.length - 1) {
              insertVoter.finalize();
              updateStreetsTable().then(() => {
                console.log(`🎉 Successfully imported ${inserted} voters into database`);
                resolve();
              }).catch(reject);
            }
          });
        });
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error);
        reject(error);
      });
  });
}

// Import voting history data - only for voters in our voter file
function importVotingHistory() {
  return new Promise((resolve, reject) => {
    console.log('🗳️ Importing voting history data (filtered by our voter NCIDs)...');

    // First, get all NCIDs from our voter file
    db.all('SELECT unique_nc_voter_id FROM voters', [], (err, voterRows) => {
      if (err) {
        console.error('Error getting voter NCIDs:', err);
        reject(err);
        return;
      }

      const voterNCIDs = new Set(voterRows.map(row => row.unique_nc_voter_id));
      console.log(`📋 Found ${voterNCIDs.size} voter NCIDs to match against`);

      const fs = require('fs');
      const path = require('path');

      const historyFiles = [
        path.join(dataDir, 'voter_history__1_ncvhis1_001.sql'),
        path.join(dataDir, 'voter_history__1_ncvhis1_002.sql')
      ];

      let totalImported = 0;

      const processFile = (filePath, callback) => {
        if (!fs.existsSync(filePath)) {
          console.log(`File not found: ${filePath}`);
          callback();
          return;
        }

        console.log(`📄 Processing ${path.basename(filePath)}...`);
        let imported = 0;
        let processed = 0;

        const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });
        let buffer = '';

        fileStream.on('data', (chunk) => {
          buffer += chunk;
          const lines = buffer.split('\n');

          // Keep the last incomplete line in buffer
          buffer = lines.pop();

          // Process lines in batches to avoid overwhelming the database
          const batchSize = 100;
          const batches = [];
          for (let i = 0; i < lines.length; i += batchSize) {
            batches.push(lines.slice(i, i + batchSize));
          }

          const processBatch = (batchIndex) => {
            if (batchIndex >= batches.length) return;

            const batch = batches[batchIndex];
            let batchProcessed = 0;

            batch.forEach((line) => {
              processed++;
              if (line.trim().startsWith('INSERT INTO voting_history')) {
                // Extract values from INSERT statement
                const valuesMatch = line.match(/VALUES\s*\(([^)]+)\)/);
                if (valuesMatch) {
                  const values = valuesMatch[1].split(',').map(v => v.trim().replace(/^'|'$/g, ''));

                  if (values.length >= 15) {
                    const voterNCID = values[10]; // unique_nc_voter_id is at index 10

                    // Only import if this NCID exists in our voter file
                    if (voterNCIDs.has(voterNCID)) {
                      db.run(`
                        INSERT OR IGNORE INTO voting_history (
                          county_id, county_desc, voter_reg_num, election_lbl, election_desc,
                          voting_method, voted_party_cd, voted_party_desc, pct_label, pct_description,
                          unique_nc_voter_id, voted_county_id, voted_county_desc, vtd_label, vtd_description
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                      `, values.slice(0, 15), (err) => {
                        if (err) {
                          console.error('Error inserting voting history:', err);
                        } else {
                          imported++;
                          if (imported % 100 === 0) {
                            console.log(`📊 Imported ${imported} voting records (of ${processed} processed)...`);
                          }
                        }
                        batchProcessed++;
                        if (batchProcessed === batch.length) {
                          // Move to next batch
                          setTimeout(() => processBatch(batchIndex + 1), 0);
                        }
                      });
                    } else {
                      batchProcessed++;
                      if (batchProcessed === batch.length) {
                        // Move to next batch
                        setTimeout(() => processBatch(batchIndex + 1), 0);
                      }
                    }
                  } else {
                    batchProcessed++;
                    if (batchProcessed === batch.length) {
                      // Move to next batch
                      setTimeout(() => processBatch(batchIndex + 1), 0);
                    }
                  }
                } else {
                  batchProcessed++;
                  if (batchProcessed === batch.length) {
                    // Move to next batch
                    setTimeout(() => processBatch(batchIndex + 1), 0);
                  }
                }
              } else {
                batchProcessed++;
                if (batchProcessed === batch.length) {
                  // Move to next batch
                  setTimeout(() => processBatch(batchIndex + 1), 0);
                }
              }
            });
          };

          // Start processing batches
          processBatch(0);
        });

        fileStream.on('end', () => {
          totalImported += imported;
          console.log(`✅ Imported ${imported} records from ${path.basename(filePath)} (processed ${processed} total lines)`);
          callback();
        });

        fileStream.on('error', (error) => {
          console.error('Error reading file:', error);
          callback();
        });
      };

      let filesProcessed = 0;
      historyFiles.forEach((filePath) => {
        processFile(filePath, () => {
          filesProcessed++;
          if (filesProcessed === historyFiles.length) {
            console.log(`🎉 Total voting history records imported: ${totalImported}`);
            resolve();
          }
        });
      });
    });
  });
}

// Update voters with election counts and village election indicators
function updateVoterStats() {
  return new Promise((resolve, reject) => {
    console.log('📊 Calculating voter statistics...');

    // Update election counts
    db.run(`
      UPDATE voters
      SET election_count = (
        SELECT COUNT(*)
        FROM voting_history vh
        WHERE vh.unique_nc_voter_id = voters.unique_nc_voter_id
      )
    `, (err) => {
      if (err) {
        console.error('Error updating election counts:', err);
        reject(err);
        return;
      }
      console.log('✅ Updated election counts');

      // Update village election voter indicators - look for various village/municipal election patterns
      db.run(`
        UPDATE voters
        SET is_village_election_voter = CASE
          WHEN EXISTS (
            SELECT 1
            FROM voting_history vh
            WHERE vh.unique_nc_voter_id = voters.unique_nc_voter_id
            AND (
              LOWER(vh.election_desc) LIKE LOWER('%MUNICIPAL%')
              OR LOWER(vh.election_desc) LIKE LOWER('%VILLAGE%')
              OR LOWER(vh.election_desc) LIKE LOWER('%ALAMANCE%')
              OR vh.election_desc LIKE '%ALA%'
            )
          ) THEN 1
          ELSE 0
        END
      `, (err) => {
        if (err) {
          console.error('Error updating village election indicators:', err);
          reject(err);
          return;
        }
        console.log('✅ Updated village election voter indicators (based on MUNICIPAL, VILLAGE, ALAMANCE, or ALA patterns)');
        resolve();
      });
    });
  });
}

// Update streets table with voter counts
function updateStreetsTable() {
  return new Promise((resolve, reject) => {
    console.log('🏘️ Updating streets table...');

    // Clear existing streets
    db.run('DELETE FROM streets', (err) => {
      if (err) {
        console.error('Error clearing streets:', err);
        reject(err);
        return;
      }

      // Insert streets with voter counts
      const insertStreet = db.prepare(`
        INSERT INTO streets (name, voter_count)
        SELECT residence_street_name, COUNT(*) as count
        FROM voters
        WHERE residence_street_name IS NOT NULL AND residence_street_name != ''
        GROUP BY residence_street_name
        ORDER BY residence_street_name
      `);

      insertStreet.run((err) => {
        if (err) {
          console.error('Error inserting streets:', err);
          reject(err);
          return;
        }

        insertStreet.finalize();

        // Get count of streets
        db.get('SELECT COUNT(*) as count FROM streets', (err, row) => {
          if (err) {
            console.error('Error counting streets:', err);
            reject(err);
            return;
          }

          console.log(`✅ Created ${row.count} street entries in database`);
          resolve();
        });
      });
    });
  });
}

// Database query functions
function getAllStreets() {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT name, voter_count as count
      FROM streets
      ORDER BY name
    `, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

function getVotersByStreet(streetName) {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT
        unique_nc_voter_id as Unique_NC_Voter_Id,
        first_name,
        last_name,
        residence_house_number,
        age,
        gender,
        race_code,
        ethnicity_code,
        political_party,
        voter_status_code as Voter_Status_Code,
        election_count,
        is_village_election_voter
      FROM voters
      WHERE residence_street_name = ?
      ORDER BY CAST(residence_house_number AS INTEGER), last_name, first_name
    `, [streetName], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

function getVoterById(ncid) {
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT * FROM voters WHERE unique_nc_voter_id = ?
    `, [ncid], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
}

function getVoterNotes(ncid) {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT note, created_at as timestamp, updated_at
      FROM voter_notes
      WHERE unique_nc_voter_id = ?
      ORDER BY created_at DESC
    `, [ncid], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

function saveVoterNote(ncid, notes) {
  return new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO voter_notes (unique_nc_voter_id, note, created_at, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [ncid, notes], function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ id: this.lastID });
    });
  });
}

function getVoterElectionHistory(ncid) {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT
        election_desc,
        election_lbl,
        voting_method,
        voted_party_cd,
        voted_party_desc,
        pct_label,
        pct_description,
        CASE
          WHEN LOWER(election_desc) LIKE LOWER('%MUNICIPAL%')
            OR LOWER(election_desc) LIKE LOWER('%VILLAGE%')
            OR LOWER(election_desc) LIKE LOWER('%ALAMANCE%')
            OR election_desc LIKE '%ALA%' THEN 1
          ELSE 0
        END as is_municipal
      FROM voting_history
      WHERE unique_nc_voter_id = ?
      ORDER BY election_lbl DESC
    `, [ncid], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

// Export functions
module.exports = {
  initDatabase,
  importVoterData,
  importVotingHistory,
  updateVoterStats,
  getAllStreets,
  getVotersByStreet,
  getVoterById,
  getVoterNotes,
  saveVoterNote,
  getVoterElectionHistory,
  db
};
