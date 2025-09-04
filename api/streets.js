// Vercel serverless function for streets endpoint
export default function handler(req, res) {
  // Mock data for now - in production this would connect to database
  const mockStreets = [
    "1st Avenue",
    "2nd Street",
    "3rd Avenue",
    "4th Street",
    "5th Avenue",
    "6th Street",
    "7th Avenue",
    "8th Street",
    "9th Avenue",
    "10th Street",
    "11th Avenue",
    "12th Street",
    "13th Avenue",
    "14th Street",
    "15th Avenue"
  ];

  res.status(200).json(mockStreets);
}
