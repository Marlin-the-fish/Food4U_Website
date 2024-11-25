import mysql from 'mysql'

export const handler = async (event) => {

  // get credentials from the db_access layer (loaded separately via AWS console)
  var pool = mysql.createPool({
    host: "food4udb.cfw68i0key7z.us-east-1.rds.amazonaws.com",
    user: "food4uAdmin",
    password: "food4uPass",
    database: "Food4U"
  })

  let DeleteRestaurant = (restaurantID) => {
    return new Promise((resolve, reject) => {
      pool.query("DELETE FROM restaurant WHERE idRestaurant=?", [restaurantID], (error, rows) => {
        if (error) { return reject(error) }
        if ((rows) && (rows.affectedRows == 1)) {
          return resolve(true)
        } else {
          return resolve(false)
        }
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
    const isAdmin = await CheckAdmin(event.username, event.password)
    if (isAdmin > 0) {
      const isDeleted = await DeleteRestaurant(event.restaurantID)
      if (isDeleted) {
        response = {
          statusCode: 200,
          restaurantID: event.restaurantID,
          isDeleted: isDeleted,
          success: "Correct Admin Credentials"
        }
      } else {
        response = {
          statusCode: 400,
          restaurantID: event.restaurantID,
          isDeleted: isDeleted,
          error: "Restaurant ID Does Not Exist"
        }
      }
    } else if (isAdmin == 0){
      response = {
        statusCode: 400,
        error : "Invalid Admin Credentials"
      }
    }
  } catch (err) {
    response = {statusCode: 400, error: err}
  }

  pool.end()     // close DB connections

  return response;
}