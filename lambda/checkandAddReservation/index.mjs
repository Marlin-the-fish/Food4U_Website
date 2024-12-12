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
  const { idTable, startTime, date, idRestaurant, idUser, seatsTaken } = event;

  console.log('Received input:', { idTable, startTime, date, idRestaurant, idUser, seatsTaken });

  // Validate inputs
  if (!idTable || !startTime || !date || !idRestaurant || !idUser || !seatsTaken) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing required fields.' }),
    };
  }

  try {
    // Check if the reservation already exists
    const [existingReservations] = await pool.execute(
      `SELECT * FROM reservation 
       WHERE idTable = ? AND startTime = ? AND date = ? AND idRestaurant = ?`,
      [idTable, startTime, date, idRestaurant]
    );

    if (existingReservations.length > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Reservation already exists for the given details.' }),
      };
    }

    // Generate a random confirmation code
    const confirmationCode = generateConfirmationCode();

    // Insert new reservation
    await pool.execute(
      `INSERT INTO reservation (confirmationCode, idTable, startTime, date, idRestaurant, idUser, seatsTaken)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [confirmationCode, idTable, startTime, date, idRestaurant, idUser, seatsTaken]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Reservation successfully created.', 
        confirmationCode: confirmationCode 
      }),
    };
  } catch (error) {
    console.error('Error processing reservation:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error.', error: error.message }),
    };
  }
};

// Helper function to generate a random confirmation code
const generateConfirmationCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};
