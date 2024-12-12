import mysql from 'mysql'

export const handler = async (event) => {

  // get credentials from the db_access layer (loaded separately via AWS console)
  var pool = mysql.createPool({
    host: "food4udb.cfw68i0key7z.us-east-1.rds.amazonaws.com",
    user: "food4uAdmin",
    password: "food4uPass",
    database: "Food4U"
  })

  let ListReservationsByRest = (restaurantID) => {
      return new Promise((resolve, reject) => {
          pool.query("SELECT * FROM reservation WHERE idRestaurant=?", [restaurantID], (error, rows) => {
              if (error) { return reject(error); }
              return resolve(rows);
          })
      })
  }

  let CheckAdmin = (username, password) => {
    return new Promise((resolve, reject) => {
      pool.query("SELECT COUNT(*) AS 'count' FROM admin WHERE username = ? AND password = ?", [username, password], (error, value) => {
        if (error) { return reject(error); }
        let output = JSON.parse(JSON.stringify(value))
        return resolve(output[0].count);
      })
    })
  }

  let response;

  try {
    const isAdmin = await CheckAdmin(event.username, event.password);
    if (isAdmin > 0) {
        const all_reservations = await ListReservationsByRest(event.restaurantID);
        if (all_reservations.length >= 0) {
            response = {
                statusCode: 200,
                restaurant: event.restaurantID,
                reservations: all_reservations,
                success: "Correct Admin Credentials and Reservations Listed"
            };
        } else {
            response = {
                statusCode: 400,
                restaurant: event.restaurantID,
                error: "Restaurant not found"
            };
        }
    } else {
        response = {
            statusCode: 400,
            error: "Invalid Admin Credentials"
        };
    }
  } catch (err) {
      response = {
          statusCode: 400,
          error: err
      };
  }

  pool.end(); // Close DB connections

  return response;
}