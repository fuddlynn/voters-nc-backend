// Vercel serverless function for street voters endpoint
export default function handler(req, res) {
  const { streetName } = req.query;

  // Mock voter data for now
  const mockVoters = [
    {
      ncid: "NC123456789",
      firstName: "John",
      lastName: "Doe",
      age: 45,
      gender: "M",
      race: "White",
      ethnicity: "Non-Hispanic",
      party: "Republican",
      address: `${streetName} 123`,
      registration: "Active"
    },
    {
      ncid: "NC987654321",
      firstName: "Jane",
      lastName: "Smith",
      age: 38,
      gender: "F",
      race: "Black",
      ethnicity: "Non-Hispanic",
      party: "Democrat",
      address: `${streetName} 456`,
      registration: "Active"
    }
  ];

  res.status(200).json(mockVoters);
}
