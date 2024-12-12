import mysql from 'mysql';

export const handler = async (event) => {
  // Create a connection pool
  var pool = mysql.createPool({
    host: "food4udb.cfw68i0key7z.us-east-1.rds.amazonaws.com",
    user: "food4uAdmin",
    password: "food4uPass",
    database: "Food4U"
  });

  // Function to list active restaurants
  let ListActiveRestaurants = () => {
    return new Promise((resolve, reject) => {
      // Retrieve only active restaurants
      pool.query("SELECT * FROM restaurant WHERE activeStatus = 'ACTIVE'", [], (error, rows) => {
        if (error) { return reject(error); }
        return resolve(rows);
      });
    });
  };

  let response;

  try {
    // Validate event data or perform pre-checks if necessary
    if (!event) {
      throw new Error("Invalid request: Missing event data");
    }

    // Fetch the list of active restaurants
    const active_restaurants = await ListActiveRestaurants();
    response = {
      statusCode: 200,
      success: true,
      restaurants: active_restaurants,
      message: "Successfully retrieved active restaurants"
    };
  } catch (error) {
    // Return a 400 status for request-related errors, 500 for others
    response = {
      statusCode: error.message.startsWith("Invalid request") ? 400 : 500,
      success: false,
      error: "Failed to retrieve active restaurants",
      details: error.message
    };
  } finally {
    pool.end(); // Close DB connections
  }

  return response;
};
