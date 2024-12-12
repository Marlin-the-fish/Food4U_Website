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
    // Log the incoming event
    console.log('Incoming event:', JSON.stringify(event, null, 2));

    const {
      username,
      password,
      name,
      address,
      openHour,
      closeHour,
      closeDates, // Use closeDates instead of openDate
      tables,
    } = event;

    if (!username || !password) {
      console.error('Missing username or password.');
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required fields: username or password.' }),
      };
    }

    // Validate openHour and closeHour
    if (
      (openHour && (openHour < 0 || openHour > 23)) ||
      (closeHour && (closeHour < 0 || closeHour > 23))
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid openHour or closeHour. Please enter a value between 0 and 23.' }),
      };
    }

    // Connect to the database
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Database connection successful.');

    // Validate manager credentials and fetch idRestaurant
    console.log('Fetching idRestaurant for username and password...');
    const [managerResult] = await connection.execute(
      'SELECT idRestaurant FROM manager WHERE username = ? AND password = ?',
      [username, password]
    );
    console.log('Manager Result:', managerResult);

    if (managerResult.length === 0) {
      console.error('Manager not found or no associated restaurant.');
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Manager not found or no associated restaurant.' }),
      };
    }

    const idRestaurant = managerResult[0].idRestaurant;

    // Check if the restaurant exists
    console.log('Checking restaurant existence and active status...');
    const [restaurantResult] = await connection.execute(
      'SELECT * FROM restaurant WHERE idRestaurant = ?',
      [idRestaurant]
    );
    console.log('Restaurant Result:', restaurantResult);

    if (restaurantResult.length === 0) {
      console.error(`Restaurant with id ${idRestaurant} not found.`);
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Restaurant not found.' }),
      };
    }

    if (restaurantResult[0].activeStatus === 'ACTIVE') {
      console.error('Cannot update restaurant while activeStatus is ACTIVE.');
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Cannot update restaurant while activeStatus is ACTIVE. Please set it to INACTIVE to make changes.',
        }),
      };
    }

    // Update restaurant details
    const restaurantFields = [];
    const restaurantParams = [];

    if (name) {
      restaurantFields.push('name = ?');
      restaurantParams.push(name);
    }
    if (address) {
      restaurantFields.push('address = ?');
      restaurantParams.push(address);
    }
    if (openHour) {
      restaurantFields.push('openHour = ?');
      restaurantParams.push(openHour);
    }
    if (closeHour) {
      restaurantFields.push('closeHour = ?');
      restaurantParams.push(closeHour);
    }

    if (restaurantFields.length > 0) {
      restaurantParams.push(idRestaurant);
      console.log('Updating restaurant with fields:', restaurantFields);
      await connection.execute(
        `UPDATE restaurant SET ${restaurantFields.join(', ')} WHERE idRestaurant = ?`,
        restaurantParams
      );
      console.log(`Restaurant with id ${idRestaurant} updated successfully.`);
    }

    // Handle close dates
    console.log('Handling close dates for idRestaurant:', idRestaurant);

    // Fetch existing close dates
    const [existingCloseDates] = await connection.execute(
      'SELECT closedDate FROM `closedDays` WHERE idRestaurant = ?',
      [idRestaurant]
    );

    const existingCloseDatesSet = new Set(existingCloseDates.map((row) => row.closedDate));

    for (const date of closeDates) {
      if (!date) continue;

      // Check for duplicates within the database
      if (existingCloseDatesSet.has(date)) {
        console.log(`Close date ${date} already exists, skipping update.`);
        continue;
      }

      const [existingDate] = await connection.execute(
        'SELECT * FROM closedDays WHERE closedDate = ? AND idRestaurant = ?',
        [date, idRestaurant]
      );

      if (existingDate.length === 0) {
        console.log('Inserting new close date:', date);
        await connection.execute(
          'INSERT INTO closedDays (closedDate, idRestaurant) VALUES (?, ?)',
          [date, idRestaurant]
        );
      } else {
        console.log('Updating existing close date:', date);
        await connection.execute(
          'UPDATE closedDays SET closedDate = ? WHERE closedDate = ? AND idRestaurant = ?',
          [date, existingDate[0].closedDate, idRestaurant]
        );
      }
    }

    console.log('All close dates handled successfully.');

    // Handle tables
    console.log('Handling tables for idRestaurant:', idRestaurant);

    // Fetch existing tables
    const [existingTables] = await connection.execute(
      'SELECT * FROM `table` WHERE idRestaurant = ?',
      [idRestaurant]
    );

    const existingTableMap = new Map(existingTables.map((t) => [t.tableNumber, t]));

    for (const [index, table] of (tables || []).entries()) {
      const existingTable = existingTableMap.get(index + 1);
      if (existingTable) {
        // Update the existing table if needed
        if (existingTable.numOfSeats !== table.seats) {
          console.log('Updating table:', {
            idTable: existingTable.idTable,
            numOfSeats: table.seats,
          });
          await connection.execute(
            'UPDATE `table` SET numOfSeats = ? WHERE idTable = ?',
            [table.seats, existingTable.idTable]
          );
        }
      } else {
        // Insert new table
        const idTable = `${Date.now()}${Math.random().toString(36).substring(2, 10)}`;
        console.log('Inserting new table:', {
          idTable,
          idRestaurant,
          numOfSeats: table.seats,
          tableNumber: index + 1,
        });
        await connection.execute(
          'INSERT INTO `table` (idTable, idRestaurant, numOfSeats, tableNumber) VALUES (?, ?, ?, ?)',
          [idTable, idRestaurant, table.seats, index + 1]
        );
      }
    }

    console.log('All table updates and insertions processed successfully.');

    // Return success response
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        message: `Restaurant, tables, and close dates updated successfully for idRestaurant: ${idRestaurant}.`,
      }),
    };
    console.log('Response to client:', response);
    return response;

  } catch (error) {
    console.error('Error updating restaurant, tables, and close dates:', error);
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
