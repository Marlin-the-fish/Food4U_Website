import mysql from 'mysql'

export const handler = async (event) => {
  
  // get credentials from the db_access layer (loaded separately via AWS console)
  var pool = mysql.createPool({
    host: "food4udb.cfw68i0key7z.us-east-1.rds.amazonaws.com",
    user: "food4uAdmin",
    password: "food4uPass",
    database: "Food4U"
  })

  // Cancel reservation associated to confirmation code and userID
  let DeleteReservation = (confirmation) => {
    return new Promise((resolve, reject) => {
      pool.query("DELETE FROM reservation WHERE confirmationCode=?", [confirmation], (error, rows) => {
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
      const isDeleted = await DeleteReservation(event.confirmation)
      if (isDeleted) {
        response = {
          statusCode: 200,
          isDeleted: isDeleted,
          success: "Reservation Has Been Canceled"
        }
      } else {
        response = {
          statusCode: 400,
          confirmationCode: event.confirmation,
          isDeleted: isDeleted,
          error: "Confirmation code is Invalid"
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

