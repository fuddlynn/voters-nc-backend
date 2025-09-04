// Vercel serverless function for health check
export default function handler(req, res) {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Voters NC Backend API is running',
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
}
