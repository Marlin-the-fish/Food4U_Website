import mysql from 'mysql2';

// Database configuration
const pool = mysql.createPool({
  host: 'food4udb.cfw68i0key7z.us-east-1.rds.amazonaws.com',
  user: 'food4uAdmin',
  password: 'food4uPass',
  database: 'Food4U',
}).promise();

export const handler = async (event) => {
  console.log('Full event object:', event);

  // Parse username and password from the event
  const username = event.username || null;
  const password = event.password || null;

  console.log('Parsed input:', { username, password });

  // Validate input
  if (!username || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing required fields: username or password.' }),
    };
  }

  try {
    // Test database connection
    const [rows] = await pool.query('SELECT 1');
    console.log('Database connection successful:', rows);

    // Check if the username and password exist in the manager table
    const [managerRows] = await pool.execute(
      'SELECT idRestaurant FROM manager WHERE username = ? AND password = ?',
      [username, password]
    );

    if (managerRows.length === 0) {
      console.error('Invalid username or password.');
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Invalid username or password.' }),
      };
    }

    // Check if idRestaurant is empty
    const manager = managerRows[0];
    const idRestaurantEmpty = !manager.idRestaurant; // true if idRestaurant is null or undefined

    console.log(`idRestaurantEmpty Status for user ${username}:`, idRestaurantEmpty);

    return {
      statusCode: 200,
      body: JSON.stringify({
        idRestaurantEmpty,
      }),
    };
  } catch (error) {
    console.error('Error checking restaurant status:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error.', error: error.message }),
    };
  }
};
