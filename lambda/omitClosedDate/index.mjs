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

  // Parse idRestaurant from the event object
  const idRestaurant = event.idRestaurant || null;

  console.log('Parsed input:', { idRestaurant });

  // Validate input
  if (!idRestaurant) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing required field: idRestaurant.' }),
    };
  }

  try {
    // Test database connection
    const [rows] = await pool.query('SELECT 1');
    console.log('Database connection successful:', rows);

    // Query to fetch all closed dates for the provided idRestaurant
    const query = `
      SELECT closedDate 
      FROM closedDays
      WHERE idRestaurant = ?
    `;

    const [closedDates] = await pool.execute(query, [idRestaurant]);

    if (closedDates.length === 0) {
      console.log('No closed dates found for the provided idRestaurant.');
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'No closed dates found for the provided idRestaurant.',
          idRestaurant,
        }),
      };
    }

    // Format closedDates to ISO 8601 strings
    const formattedDates = closedDates.map((row) => new Date(row.closedDate).toISOString());
    console.log('Formatted Closed Dates:', formattedDates);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Closed dates retrieved successfully.',
        closedDates: formattedDates,
      }),
    };
  } catch (error) {
    console.error('Error retrieving closed dates:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error.', error: error.message }),
    };
  }
};
