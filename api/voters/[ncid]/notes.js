// Vercel serverless function for voter notes endpoint
export default function handler(req, res) {
  const { ncid } = req.query;

  if (req.method === 'GET') {
    // Return mock notes
    const mockNotes = [
      {
        id: 1,
        note: "Called voter - interested in local election",
        timestamp: "2024-12-15T10:30:00Z"
      },
      {
        id: 2,
        note: "Left message about voting location",
        timestamp: "2024-12-10T14:20:00Z"
      }
    ];
    res.status(200).json(mockNotes);

  } else if (req.method === 'POST') {
    // Save new note
    const { note } = req.body;
    const newNote = {
      id: Date.now(),
      note: note,
      timestamp: new Date().toISOString()
    };
    res.status(201).json(newNote);

  } else if (req.method === 'DELETE') {
    // Delete all notes
    res.status(200).json({
      success: true,
      message: "All notes deleted",
      deletedCount: 2
    });

  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
