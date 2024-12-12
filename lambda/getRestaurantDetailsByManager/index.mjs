import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'food4udb.cfw68i0key7z.us-east-1.rds.amazonaws.com',
  user: 'food4uAdmin',
  password: 'food4uPass',
  database: 'Food4U',
};

export const handler = async (event) => {
  const { username, password } = event;

  if (!username || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing username or password.' }),
    };
  }

  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    // Validate manager credentials and fetch idRestaurant
    const [managerResult] = await connection.execute(
      'SELECT idRestaurant FROM manager WHERE username = ? AND password = ?',
      [username, password]
    );

    if (managerResult.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Manager not found.' }),
      };
    }

    const idRestaurant = managerResult[0].idRestaurant;

    // Fetch restaurant details
    const [restaurantResult] = await connection.execute(
      'SELECT * FROM restaurant WHERE idRestaurant = ?',
      [idRestaurant]
    );

    if (restaurantResult.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Restaurant not found.' }),
      };
    }

    // Fetch closeDate associated with the restaurant
    const [closeDateResult] = await connection.execute(
      'SELECT * FROM `closedDays` WHERE idRestaurant = ?',
      [idRestaurant]
    );

    // Format the dates into YYYY-MM-DD
    const formattedCloseDates = closeDateResult.map((row) =>
      row.closedDate.toISOString().split('T')[0]
    );

    console.log('Close Date Results:', closeDateResult);

    // Fetch tables associated with the restaurant
    const [tablesResult] = await connection.execute(
      'SELECT * FROM `table` WHERE idRestaurant = ?',
      [idRestaurant]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        restaurant: restaurantResult[0],
        tables: tablesResult,
        closeDates: formattedCloseDates, // Extract the closedDate field
      }),
    };
  } catch (error) {
    console.error('Error fetching restaurant details:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error.', error: error.message }),
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};
