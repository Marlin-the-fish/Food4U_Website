import mysql from 'mysql'

export const handler = async (event) => {

  // get credentials from the db_access layer (loaded separately via AWS console)
  var pool = mysql.createPool({
    host: "food4udb.cfw68i0key7z.us-east-1.rds.amazonaws.com",
    user: "food4uAdmin",
    password: "food4uPass",
    database: "Food4U"
  })

  let ListRestaurants = () => {
      return new Promise((resolve, reject) => {
          pool.query("SELECT * FROM restaurant", [], (error, rows) => {
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
  
  const isAdmin = await CheckAdmin(event.username, event.password)
    if (isAdmin > 0) {
      const all_restaurants = await ListRestaurants()
        response = {
          statusCode: 200,
          restaurants: all_restaurants,
          success : "Correct Admin Credentials"
        }
    } else if (isAdmin == 0) {
      response = {
        statusCode: 400,
        error : "Invalid Admin Credentials"
      }
    }

  pool.end()     // close DB connections

  return response;
}