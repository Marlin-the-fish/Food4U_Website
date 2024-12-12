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
      body: JSON.stringify({ message: 'Missing required fields: username or password.' }),
    };
  }

  let connection;

  try {
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

    // Delete the restaurant
    const [deleteRestaurantResult] = await connection.execute(
      'DELETE FROM restaurant WHERE idRestaurant = ?',
      [idRestaurant]
    );

    if (deleteRestaurantResult.affectedRows === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Restaurant not found.' }),
      };
    }

    // Delete the manager account
    const [deleteManagerResult] = await connection.execute(
      'DELETE FROM manager WHERE idRestaurant = ?',
      [idRestaurant]
    );

    if (deleteManagerResult.affectedRows === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Manager account not found or already deleted.' }),
      };
    }

    // Delete closeDays
    const [deleteCloseDateResult] = await connection.execute(
      'DELETE FROM closeDays WHERE idRestaurant = ?',
      [idRestaurant]
    );

    if (deleteCloseDateResult.affectedRows === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Close date not found or already deleted.' }),
      };
    }

      // Delete reservation
      const [deleteReservationResult] = await connection.execute(
        'DELETE FROM reservation WHERE idRestaurant = ?',
        [idRestaurant]
      );
  
      if (deleteReservationResult.affectedRows === 0) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: 'Reservation not found or already deleted.' }),
        };
      }

    // Delete table
    const [deleteTableResult] = await connection.execute(
      'DELETE FROM `table` WHERE idRestaurant = ?',
      [idRestaurant]
    );

    if (deleteTableResult.affectedRows === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Table not found or already deleted.' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Restaurant and associated manager account deleted successfully.',
      }),
    };
  } catch (error) {
    console.error('Error deleting restaurant or manager:', error);
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
