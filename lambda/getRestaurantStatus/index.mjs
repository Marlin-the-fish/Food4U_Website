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
    // Connect to the database
    connection = await mysql.createConnection(dbConfig);

    // Validate manager credentials
    const [managerResult] = await connection.execute(
      'SELECT idRestaurant FROM manager WHERE username = ? AND password = ?',
      [username, password]
    );

    if (managerResult.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Manager not found or invalid credentials.' }),
      };
    }

    const idRestaurant = managerResult[0].idRestaurant;

    // Fetch the active status of the restaurant
    const [restaurantResult] = await connection.execute(
      'SELECT activeStatus FROM restaurant WHERE idRestaurant = ?',
      [idRestaurant]
    );

    if (restaurantResult.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Restaurant not found.' }),
      };
    }

    const activeStatus = restaurantResult[0].activeStatus;

    return {
      statusCode: 200,
      body: JSON.stringify({ activeStatus }),
    };
  } catch (error) {
    console.error('Error fetching restaurant status:', error);
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
