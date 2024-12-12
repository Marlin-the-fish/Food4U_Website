import mysql from 'mysql2';

// Database configuration
const pool = mysql.createPool({
  host: 'food4udb.cfw68i0key7z.us-east-1.rds.amazonaws.com',
  user: 'food4uAdmin',
  password: 'food4uPass',
  database: 'Food4U',
}).promise();

// Function to generate a unique ID
function generateUniqueId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
}

export const handler = async (event) => {
  console.log('Full event object:', event);

  // Parse inputs directly from event
  const name = event.name || null;
  const address = event.address || null;
  const username = event.username || null;
  const password = event.password || null;

  console.log('Parsed input:', { name, address, username, password });

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
      'SELECT * FROM manager WHERE username = ? AND password = ?',
      [username, password]
    );

    if (managerRows.length === 0) {
      console.error('Invalid username or password.');
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Invalid username or password.' }),
      };
    }

    // Generate a unique restaurant ID
    const restaurantId = generateUniqueId();
    const query = `
    INSERT INTO restaurant (idRestaurant, name, address, activeStatus)
    VALUES (?, ?, ?, 'INACTIVE')
    `;

    await pool.execute(query, [restaurantId, name, address]);

    console.log('Restaurant created successfully with ID:', restaurantId);

    // Update the idRestaurant in the manager table for the matching manager
    const [updateResult] = await pool.execute(
      'UPDATE manager SET idRestaurant = ? WHERE username = ? AND password = ?',
      [restaurantId, username, password]
    );

    if (updateResult.affectedRows === 0) {
      console.error('Failed to update manager with idRestaurant.');
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Failed to update manager with idRestaurant.' }),
      };
    }

    console.log('Manager updated successfully with new idRestaurant:', restaurantId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Restaurant created successfully and manager updated.',
        restaurantId,
      }),
    };
  } catch (error) {
    console.error('Error creating restaurant or updating manager:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error.', error: error.message }),
    };
  }
};
