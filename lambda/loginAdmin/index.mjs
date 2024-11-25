import mysql from 'mysql'

export const handler = async (event) => {
  
  // get credentials from the db_access layer (loaded separately via AWS console)
  var pool = mysql.createPool({
      host: "food4udb.cfw68i0key7z.us-east-1.rds.amazonaws.com",
      user: "food4uAdmin",
      password: "food4uPass",
      database: "Food4U"
  })

  let CountAdmin = () => {
    return new Promise((resolve, reject) => {
      pool.query("SELECT COUNT(*) AS 'num' FROM admin;", [], (error, value) => {
        if (error) { return reject(error); }
        let output = JSON.parse(JSON.stringify(value))
        return resolve(output[0].num);
      })
    })
  }
  
  let CreateAdmin = (username, password) => {
    return new Promise((resolve, reject) => {
      pool.query("INSERT INTO admin (username, password) VALUES (?, ?);", [username, password], (error, rows) => {
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

  const numOfAdmin = await CountAdmin()
  let response;
  if (numOfAdmin == 1) {
    const isAdmin = await CheckAdmin(event.username, event.password)
    if (isAdmin > 0) {
      response = {
        statusCode: 200,
        result: {
          "username" : event.username,
          "password" : event.password
        },
        success : "Correct Admin Credentials"
      }
    } else if (isAdmin == 0) {
      response = {
        statusCode: 400,
        error : "Invalid Admin Credentials",
        result: {
          "username" : event.username,
          "password" : event.password
        }
      }
    }
  } else if (numOfAdmin == 0) {
    const createdAdmin = await CreateAdmin(event.username, event.password)
    response = {
      statusCode: 200,
      admin: {
        "username" : event.username,
        "password" : event.password,
      },
      success : "New Admin Created"
    }
  } else {
    response = {
      statusCode: 400,
      error : "Unexpected number of admin entries"
    }
  }
  
  pool.end()     // close DB connections

  return response;
}