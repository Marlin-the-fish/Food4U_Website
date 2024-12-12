import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'food4udb.cfw68i0key7z.us-east-1.rds.amazonaws.com',
  user: 'food4uAdmin',
  password: 'food4uPass',
  database: 'Food4U',
};

export const handler = async (event) => {
  let connection;

  try {
    console.log('Incoming event for deleteCloseDate:', JSON.stringify(event, null, 2));
    const { username, password, closeDate } = event;

    if (!username || !password || !closeDate) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required fields: username, password, or closeDate.' }),
      };
    }

    connection = await mysql.createConnection(dbConfig);
    console.log('Database connection successful.');

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

    // Delete the close date for the restaurant
    const [deleteResult] = await connection.execute(
      'DELETE FROM closedDays WHERE idRestaurant = ? AND closedDate = ?',
      [idRestaurant, closeDate]
    );

    if (deleteResult.affectedRows > 0) {
      console.log(`Close date ${closeDate} deleted successfully for restaurant ID ${idRestaurant}.`);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: `Close date ${closeDate} deleted successfully.` }),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Close date not found or already deleted.' }),
      };
    }
  } catch (error) {
    console.error('Error deleting close date:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error.', error: error.message }),
    };
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
};
