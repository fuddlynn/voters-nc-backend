// Vercel serverless function for voter details endpoint
export default function handler(req, res) {
  const { ncid } = req.query;

  // Mock voter detail data
  const mockVoterDetail = {
    ncid: ncid,
    firstName: "John",
    lastName: "Doe",
    age: 45,
    gender: "M",
    race: "White",
    ethnicity: "Non-Hispanic",
    party: "Republican",
    address: "123 Main Street",
    city: "Alamance",
    state: "NC",
    zip: "27201",
    registration: "Active",
    registrationDate: "2020-01-15",
    lastVoted: "2024-11-05"
  };

  res.status(200).json(mockVoterDetail);
}
