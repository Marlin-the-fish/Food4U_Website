const mysql = require('mysql');

// Create a connection to the database
const connection = mysql.createConnection({
  host: 'food4udb.cfw68i0key7z.us-east-1.rds.amazonaws.com',
  user: 'food4uAdmin',
  password: 'food4uPass',
  database: 'Food4U',
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting:', err.stack);
    return;
  }
  console.log('Connected as id', connection.threadId);

  // Query to select only active restaurants
  const query = "SELECT * FROM restaurant WHERE activeStatus = 'ACTIVE'";
  connection.query(query, (error, results, fields) => {
    if (error) {
      console.error('Error fetching data:', error.stack);
    } else {
      console.log('Active Restaurants:', results);
    }

    // End the connection after the query is executed
    connection.end((endErr) => {
      if (endErr) {
        console.error('Error ending the connection:', endErr.stack);
      } else {
        console.log('Connection closed.');
      }
    });
  });
});
