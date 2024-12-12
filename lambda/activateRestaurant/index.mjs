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
    // Log the incoming event for debugging
    console.log('Incoming event:', event);

    // Extract username and password directly from the event
    const { username, password } = event;

    // Validate input
    if (!username || !password) {
      console.error('Missing username or password in the request.');
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Missing required fields: username or password.',
        }),
      };
    }

    // Connect to the database
    connection = await mysql.createConnection(dbConfig);
    console.log('Database connection successful.');

    // Get the idRestaurant associated with the username and password from the manager table
    const [manager] = await connection.execute(
      'SELECT idRestaurant FROM manager WHERE username = ? AND password = ?',
      [username, password]
    );

    if (manager.length === 0 || !manager[0].idRestaurant) {
      console.error('No matching manager or idRestaurant found.');
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Manager not found or not associated with a restaurant.' }),
      };
    }

    const idRestaurant = manager[0].idRestaurant;

    // Check if the restaurant exists and get its current activeStatus
    const [restaurant] = await connection.execute(
      'SELECT activeStatus FROM restaurant WHERE idRestaurant = ?',
      [idRestaurant]
    );

    if (restaurant.length === 0) {
      console.error(`Restaurant with id ${idRestaurant} not found.`);
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Restaurant not found.' }),
      };
    }

    // Get the current activeStatus
    const currentStatus = restaurant[0].activeStatus;

    // Toggle the activeStatus
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    // Update the activeStatus in the database
    const [result] = await connection.execute(
      'UPDATE restaurant SET activeStatus = ? WHERE idRestaurant = ?',
      [newStatus, idRestaurant]
    );

    if (result.affectedRows === 0) {
      console.error(`No changes made to the restaurant with id ${idRestaurant}.`);
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'No changes made to the restaurant.' }),
      };
    }

    // Success response
    console.log(
      `Restaurant activeStatus changed to ${newStatus} successfully for id ${idRestaurant}.`
    );
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Restaurant activeStatus changed to ${newStatus} successfully.`,
        idRestaurant,
        updatedStatus: newStatus,
      }),
    };
  } catch (error) {
    console.error('Error toggling restaurant activeStatus:', error);
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
