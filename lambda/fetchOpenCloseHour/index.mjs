import mysql from 'mysql2';

const pool = mysql.createPool({
  host: 'food4udb.cfw68i0key7z.us-east-1.rds.amazonaws.com',
  user: 'food4uAdmin',
  password: 'food4uPass',
  database: 'Food4U',
}).promise();

// Main handler function
export const handler = async (event) => {
  console.log('Received event:', event);

  const idRestaurant = event.idRestaurant || null;

  console.log('Parsed input:', { idRestaurant });

  // Validate input
  if (!idRestaurant) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Missing required field: idRestaurant.',
      }),
    };
  }

  try {
    // Fetch openHour and closeHour for the given idRestaurant
    const [rows] = await pool.execute(
      `SELECT openHour, closeHour FROM restaurant WHERE idRestaurant = ?`,
      [idRestaurant]
    );

    if (rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'No restaurant found with the given idRestaurant.',
        }),
      };
    }

    // Return openHour and closeHour
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Restaurant hours fetched successfully.',
        openHour: rows[0].openHour,
        closeHour: rows[0].closeHour,
      }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error.', error: error.message }),
    };
  }
};