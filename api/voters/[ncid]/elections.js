// Vercel serverless function for voter elections endpoint
export default function handler(req, res) {
  const { ncid } = req.query;

  // Mock election history data
  const mockElections = [
    {
      election_lbl: "2024 General Election",
      election_desc: "Presidential and Congressional Election",
      election_date: "2024-11-05",
      voted: true
    },
    {
      election_lbl: "2024 Primary Election",
      election_desc: "Party Primary Election",
      election_date: "2024-03-05",
      voted: true
    },
    {
      election_lbl: "2022 Midterm Election",
      election_desc: "Congressional and State Election",
      election_date: "2022-11-08",
      voted: false
    },
    {
      election_lbl: "2020 General Election",
      election_desc: "Presidential Election",
      election_date: "2020-11-03",
      voted: true
    }
  ];

  res.status(200).json(mockElections);
}
