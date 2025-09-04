const http = require('http');

console.log('🗑️ Deleting Shawn Francis notes via API...\n');

// First, find Shawn Francis to get his NCID
const getVotersOptions = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/streets/Freedom%20Drive/voters',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(getVotersOptions, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const voters = JSON.parse(data);

      // Find Shawn Francis
      const shawn = voters.find(v =>
        v.first_name && v.first_name.toLowerCase() === 'shawn' &&
        v.last_name && v.last_name.toLowerCase() === 'francis'
      );

      if (!shawn) {
        console.log('❌ Shawn Francis not found on Freedom Drive');
        return;
      }

      console.log('✅ Found Shawn Francis:', shawn.first_name, shawn.last_name);
      console.log('🆔 NCID:', shawn.Unique_NC_Voter_Id);

      // Now delete his notes
      const deleteOptions = {
        hostname: 'localhost',
        port: 3001,
        path: `/api/voters/${shawn.Unique_NC_Voter_Id}/notes`,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const deleteReq = http.request(deleteOptions, (deleteRes) => {
        let deleteData = '';

        deleteRes.on('data', (chunk) => {
          deleteData += chunk;
        });

        deleteRes.on('end', () => {
          console.log('✅ Delete response:', deleteData);
          console.log('🎉 Notes deletion completed!');
        });
      });

      deleteReq.on('error', (err) => {
        console.error('❌ Error deleting notes:', err.message);
      });

      deleteReq.end();

    } catch (error) {
      console.error('❌ Error parsing response:', error.message);
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Error fetching voters:', err.message);
});

req.end();
