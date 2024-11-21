import mysql from 'mysql'

export const handler = async (event) => {
  
  // get credentials from the db_access layer (loaded separately via AWS console)
  var pool = mysql.createPool({
      host: "calculatordb.chlxnoru1n0z.us-east-1.rds.amazonaws.com",
      user: "calcAdmin",
      password: "calc:pass",
      database: "calc"
  })
  
  let ListConstants = () => {
      return new Promise((resolve, reject) => {
          pool.query("SELECT * FROM Constants", [], (error, rows) => {
              if (error) { return reject(error); }
              return resolve(rows);
          })
      })
  }

  const all_constants = await ListConstants()
  
  const response = {
    statusCode: 200,
    constants: all_constants
  }
  
  pool.end()     // close DB connections

  return response;
}

