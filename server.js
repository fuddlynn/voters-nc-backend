const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase, importVoterData, importVotingHistory, updateVoterStats, getAllStreets, getVotersByStreet, getVoterById, getVoterNotes, saveVoterNote, getVoterElectionHistory } = require('./database');

const app = express();

// Global database initialization flag
let isInitialized = false;

// Initialize database and import data
async function initializeApp() {
  if (isInitialized) return;

  try {
    console.log('🔧 Initializing database...');
    await initDatabase();

    console.log('📊 Importing voter data...');
    await importVoterData();

    console.log('🗳️ Importing voting history...');
    await importVotingHistory();

    console.log('📊 Calculating voter statistics...');
    await updateVoterStats();

    console.log('✅ Database ready!');
    isInitialized = true;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    // Don't throw in serverless environment
  }
}

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

// Database initialization middleware
app.use(async (req, res, next) => {
  if (!isInitialized) {
    await initializeApp();
  }
  next();
});

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    initialized: isInitialized
  });
});

// Get all streets
app.get('/api/streets', async (req, res) => {
  try {
    const streets = await getAllStreets();
    res.json(streets);
  } catch (error) {
    console.error('Error fetching streets:', error);
    res.status(500).json({ error: 'Failed to fetch streets' });
  }
});

// Get voters for a specific street
app.get('/api/streets/:streetName/voters', async (req, res) => {
  try {
    const streetName = decodeURIComponent(req.params.streetName);
    const voters = await getVotersByStreet(streetName);
    res.json(voters);
  } catch (error) {
    console.error('Error fetching voters for street:', error);
    res.status(500).json({ error: 'Failed to fetch voters' });
  }
});

// Get detailed voter information
app.get('/api/voters/:ncid', async (req, res) => {
  try {
    const ncid = req.params.ncid;
    const voter = await getVoterById(ncid);

    if (!voter) {
      return res.status(404).json({ error: 'Voter not found' });
    }

    res.json(voter);
  } catch (error) {
    console.error('Error fetching voter:', error);
    res.status(500).json({ error: 'Failed to fetch voter' });
  }
});

// Get voter notes
app.get('/api/voters/:ncid/notes', async (req, res) => {
  try {
    const ncid = req.params.ncid;
    const notes = await getVoterNotes(ncid);
    res.json(notes);
  } catch (error) {
    console.error('Error fetching voter notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Save voter notes
app.post('/api/voters/:ncid/notes', async (req, res) => {
  try {
    const ncid = req.params.ncid;
    const { notes } = req.body;

    if (!notes || !notes.trim()) {
      return res.status(400).json({ error: 'Notes cannot be empty' });
    }

    await saveVoterNote(ncid, notes.trim());
    res.json({ success: true, message: 'Notes saved successfully' });
  } catch (error) {
    console.error('Error saving voter notes:', error);
    res.status(500).json({ error: 'Failed to save notes' });
  }
});

// Delete all voter notes
app.delete('/api/voters/:ncid/notes', async (req, res) => {
  try {
    const ncid = req.params.ncid;
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./voters.db');

    db.run('DELETE FROM voter_notes WHERE unique_nc_voter_id = ?', [ncid], function(err) {
      if (err) {
        console.error('Error deleting notes:', err);
        res.status(500).json({ error: 'Failed to delete notes' });
        db.close();
        return;
      }

      console.log(`Deleted ${this.changes} notes for NCID: ${ncid}`);
      res.json({
        success: true,
        message: `Successfully deleted ${this.changes} notes`,
        deletedCount: this.changes
      });
      db.close();
    });

  } catch (error) {
    console.error('Error deleting voter notes:', error);
    res.status(500).json({ error: 'Failed to delete notes' });
  }
});

// Get voter election history
app.get('/api/voters/:ncid/elections', async (req, res) => {
  try {
    const ncid = req.params.ncid;
    const elections = await getVoterElectionHistory(ncid);
    res.json(elections);
  } catch (error) {
    console.error('Error fetching voter elections:', error);
    res.status(500).json({ error: 'Failed to fetch elections' });
  }
});

// Handle OPTIONS requests for CORS
app.options('*', (req, res) => {
  res.sendStatus(200);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Voters NC Backend API',
    status: 'Running',
    endpoints: [
      'GET /api/health',
      'GET /api/streets',
      'GET /api/streets/:streetName/voters',
      'GET /api/voters/:ncid',
      'GET /api/voters/:ncid/notes',
      'POST /api/voters/:ncid/notes',
      'DELETE /api/voters/:ncid/notes',
      'GET /api/voters/:ncid/elections'
    ]
  });
});

// Export for Vercel
module.exports = app;
