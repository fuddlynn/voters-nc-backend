const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

console.log('🚀 Starting test server...');

// Simple test endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Test server is running', timestamp: new Date().toISOString() });
});

app.get('/api/streets', (req, res) => {
  // Return some dummy data to test the connection
  const dummyStreets = [
    { name: 'ARAMANCHE DR', count: 50 },
    { name: 'FREEDOM DR', count: 45 },
    { name: 'BROOKSTONE DR', count: 40 },
    { name: 'LIBERTY DR', count: 35 },
    { name: 'ELDER LN', count: 30 }
  ];
  res.json(dummyStreets);
});

app.listen(PORT, () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log(`🌐 API available at http://localhost:${PORT}/api`);
});
