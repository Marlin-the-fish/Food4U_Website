import mysql from 'mysql'

export const handler = async (event) => {
  
  // get credentials from the db_access layer (loaded separately via AWS console)
  var pool = mysql.createPool({
    host: "food4udb.cfw68i0key7z.us-east-1.rds.amazonaws.com",
    user: "food4uAdmin",
    password: "food4uPass",
    database: "Food4U"
  })

  // Check if reservation exists and matches userID
  let CheckReservation = (confirmation, userID) => {
    return new Promise((resolve, reject) => {
        pool.query(
            "SELECT * FROM reservation WHERE confirmationCode = ? AND idUser = ?", 
            [confirmation, userID], 
            (error, rows) => {
                if (error) {
                    return reject(error);
                }
                if (rows && rows.length > 0) {
                    return resolve(true); // Reservation found and matches userID
                } else {
                    return resolve(false); // No matching reservation
                }
            }
        );
    });
  };

  // Delete reservation if it exists
  let DeleteReservation = (confirmation) => {
    return new Promise((resolve, reject) => {
        pool.query(
            "DELETE FROM reservation WHERE confirmationCode = ?", 
            [confirmation], 
            (error, rows) => {
                if (error) {
                    return reject(error);
                }
                if (rows && rows.affectedRows == 1) {
                    return resolve(true); // Successfully deleted
                } else {
                    return resolve(false); // No rows deleted
                }
            }
        );
    });
  };

  let response;

  try {
    const reservationExists = await CheckReservation(event.confirmation, event.userID);
    if (reservationExists) {
        const isDeleted = await DeleteReservation(event.confirmation);
        if (isDeleted) {
            response = {
                statusCode: 200,
                isDeleted: isDeleted,
                success: "Reservation has been canceled successfully."
            };
        } else {
            response = {
                statusCode: 400,
                confirmationCode: event.confirmation,
                isDeleted: isDeleted,
                error: "Failed to delete reservation."
            };
        }
    } else {
        response = {
            statusCode: 400,
            confirmationCode: event.confirmation,
            userID: event.userID,
            error: "Reservation not found or user does not have permission to delete this reservation."
        };
    }
  } catch (err) {
    response = {
        statusCode: 400,
        error: `An error occurred: ${err.message}`
    };
  }

  pool.end(); // Close DB connections

  return response;
}