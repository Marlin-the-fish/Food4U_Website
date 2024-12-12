import mysql from 'mysql2';

const pool = mysql.createPool({
  host: 'food4udb.cfw68i0key7z.us-east-1.rds.amazonaws.com',
  user: 'food4uAdmin',
  password: 'food4uPass',
  database: 'Food4U',
}).promise();

// Main handler function
export const handler = async (event) => {
  console.log('Received event:', event);

  const restaurants = event.restaurants || [];
  const numberOfSeats = event.numberOfSeats || null;

  console.log('Parsed input:', { restaurants, numberOfSeats });

  // Validate inputs
  if (!restaurants.length || !numberOfSeats) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Missing required fields: restaurants or numberOfSeats.',
      }),
    };
  }

  try {
    const filteredRestaurants = [];

    for (const restaurant of restaurants) {
      const { idRestaurant } = restaurant;

      // Fetch all tables for the restaurant with sufficient seats
      const [tables] = await pool.execute(
        `SELECT idTable FROM \`table\` WHERE idRestaurant = ? AND numOfSeats >= ?`,
        [idRestaurant, numberOfSeats]
      );

      if (tables.length > 0) {
        // Add restaurant to filtered list
        filteredRestaurants.push({
          idRestaurant: restaurant.idRestaurant,
          address: restaurant.address,
          name: restaurant.name,
          activeStatus: restaurant.activeStatus,
          openHour: restaurant.openHour,
          closeHour: restaurant.closeHour,
        });
      }
    }

    if (filteredRestaurants.length > 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          restaurants: filteredRestaurants,
        }),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'No restaurants with sufficient seats found.',
        }),
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
