import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'food4udb.cfw68i0key7z.us-east-1.rds.amazonaws.com',
  user: 'food4uAdmin',
  password: 'food4uPass',
  database: 'Food4U',
};

export const handler = async (event) => {
  const { username, password, date, time } = event;

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

    // Build dynamic query
    let query = `
      SELECT 
        r.date, 
        r.startTime, 
        t.tableNumber, 
        u.name AS userName, 
        u.email AS userEmail, 
        r.confirmationCode AS confirmationStatus
      FROM reservation r
      LEFT JOIN user u ON r.idUser = u.idUser
      LEFT JOIN \`table\` t ON r.idTable = t.idTable
      WHERE r.idRestaurant = ?
    `;
    const params = [idRestaurant];

    if (date) {
      query += ' AND r.date = ?';
      params.push(date);
    }

    if (typeof time !== 'undefined') {
      query += ' AND r.startTime = ?';
      params.push(time);
    }

    // Execute the query
    const [reservationResult] = await connection.execute(query, params);

    return {
      statusCode: 200,
      body: JSON.stringify({
        reservations: reservationResult,
      }),
    };
  } catch (error) {
    console.error('Error fetching reservations:', error);
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
