import mysql from 'mysql2';

// Create the MySQL connection pool
const pool = mysql.createPool({
  host: 'food4udb.cfw68i0key7z.us-east-1.rds.amazonaws.com',
  user: 'food4uAdmin',
  password: 'food4uPass',
  database: 'Food4U',
}).promise();

// Main handler function
export const handler = async (event) => {
  const { email, confirmationCode } = event;

  console.log('Received input:', { email, confirmationCode });

  // Validate inputs
  if (!email || !confirmationCode) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing required fields: email and/or confirmationCode.' }),
    };
  }

  try {
    // Find idUser based on the email
    const [userResults] = await pool.execute(
      `SELECT idUser FROM user WHERE email = ?`,
      [email]
    );

    if (userResults.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'User with the provided email not found.' }),
      };
    }

    const idUser = userResults[0].idUser;

    // Find reservation details using idUser and confirmationCode
    const [reservationResults] = await pool.execute(
      `SELECT * FROM reservation WHERE idUser = ? AND confirmationCode = ?`,
      [idUser, confirmationCode]
    );

    if (reservationResults.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'No reservation found for the given details.' }),
      };
    }

    const reservation = reservationResults[0];
    const { idRestaurant } = reservation;

    // Find restaurant name using idRestaurant
    const [restaurantResults] = await pool.execute(
      `SELECT name FROM restaurant WHERE idRestaurant = ?`,
      [idRestaurant]
    );

    if (restaurantResults.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Restaurant associated with the reservation not found.' }),
      };
    }

    const restaurantName = restaurantResults[0].name;

    // Return reservation details along with the restaurant name
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Reservation found successfully.',
        reservation: {
          ...reservation,
          restaurantName,
        },
      }),
    };
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error.', error: error.message }),
    };
  }
};
