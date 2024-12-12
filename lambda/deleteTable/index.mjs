import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'food4udb.cfw68i0key7z.us-east-1.rds.amazonaws.com',
  user: 'food4uAdmin',
  password: 'food4uPass',
  database: 'Food4U',
};

export const handler = async (event) => {
  const { username, password, idTable } = event;

  if (!username || !password || !idTable) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing required fields: username, password, or idTable.' }),
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
        body: JSON.stringify({ message: 'Manager not found.' }),
      };
    }

    const idRestaurant = managerResult[0].idRestaurant;

    // Get the table details to determine the tableNumber of the table being deleted
    const [tableResult] = await connection.execute(
      'SELECT tableNumber FROM `table` WHERE idTable = ?',
      [idTable]
    );

    if (tableResult.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Table not found.' }),
      };
    }

    const tableNumberToDelete = tableResult[0].tableNumber;

    // Delete the table
    const [deleteResult] = await connection.execute(
      'DELETE FROM `table` WHERE idTable = ?',
      [idTable]
    );

    if (deleteResult.affectedRows === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Table not found.' }),
      };
    }

    // Update table numbers for remaining tables
    const [updateResult] = await connection.execute(
      'UPDATE `table` SET tableNumber = tableNumber - 1 WHERE idRestaurant = ? AND tableNumber > ?',
      [idRestaurant, tableNumberToDelete]
    );

    console.log('Updated table numbers:', updateResult.affectedRows);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Table deleted and table numbers updated successfully.',
      }),
    };
  } catch (error) {
    console.error('Error deleting table or updating table numbers:', error);
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
