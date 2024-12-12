import mysql from 'mysql2';

const pool = mysql.createPool({
  host: 'food4udb.cfw68i0key7z.us-east-1.rds.amazonaws.com',
  user: 'food4uAdmin',
  password: 'food4uPass',
  database: 'Food4U',
}).promise();

// Main handler function
export const handler = async (event) => {
  console.log('Full event object:', event);

  const idRestaurant = event.idRestaurant || null;
  const numberOfSeats = event.numberOfSeats || null;
  const date = event.date || null; // Include date input
  const startTime = event.startTime || null; // Include startTime input

  console.log('Parsed input:', { idRestaurant, numberOfSeats, date, startTime });

  // Validate inputs
  if (!idRestaurant || !numberOfSeats || !date || !startTime) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Missing required fields: idRestaurant, numberOfSeats, date, or startTime.',
      }),
    };
  }

  try {
    // Test database connection
    const [rows] = await pool.query('SELECT 1');
    console.log('Database connection successful:', rows);

    // Fetch all tables for the given restaurant with sufficient seats
    const [tables] = await pool.execute(
      `SELECT idTable FROM \`table\` WHERE idRestaurant = ? AND numOfSeats >= ?`,
      [idRestaurant, numberOfSeats]
    );

    if (tables.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'No tables with sufficient seats found.' }),
      };
    }

    console.log('Available tables:', tables);

    // Check for table availability based on date and startTime
    const availableTable = await checkAvailableTables(tables, date, startTime);
    if (availableTable) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Table available.',
          idTable: availableTable,
        }),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'No tables available at the given time.' }),
      };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error.', error: error.message }),
    };
  }
};

// Additional function to check table availability
const checkAvailableTables = async (tables, date, startTime) => {
  for (const table of tables) {
    const { idTable } = table;

    try {
      // Check if the table is reserved at the given date and time
      const [reservations] = await pool.execute(
        `SELECT * 
         FROM reservation 
         WHERE idTable = ? AND date = ? AND startTime = ?`,
        [idTable, date, startTime]
      );

      if (reservations.length === 0) {
        console.log(`Table ${idTable} is available.`);
        return idTable; // Return the first available table
      }
    } catch (error) {
      console.error(`Error checking reservations for table ${idTable}:`, error);
    }
  }
  return null; // No tables available
};
