import mysql from 'mysql';

export const handler = async (event) => {
    // Get credentials from the db_access layer (loaded separately via AWS console)
    const pool = mysql.createPool({
        host: "food4udb.cfw68i0key7z.us-east-1.rds.amazonaws.com",
        user: "food4uAdmin",
        password: "food4uPass",
        database: "Food4U",
    });

    // Function to count the number of admins in the database
    const CountAdmin = () => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT COUNT(*) AS 'num' FROM admin;", [], (error, value) => {
                if (error) {
                    return reject(error);
                }
                let output = JSON.parse(JSON.stringify(value));
                return resolve(output[0].num);
            });
        });
    };

    // Function to create a new admin
    const CreateAdmin = (username, password) => {
        return new Promise((resolve, reject) => {
            pool.query(
                "INSERT INTO admin (username, password) VALUES (?, ?);",
                [username, password],
                (error, rows) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(rows);
                }
            );
        });
    };

    // Function to check admin credentials for login
    const CheckAdmin = (username, password) => {
        return new Promise((resolve, reject) => {
            pool.query(
                "SELECT COUNT(*) AS 'count' FROM admin WHERE username = ? AND password = ?",
                [username, password],
                (error, value) => {
                    if (error) {
                        return reject(error);
                    }
                    let output = JSON.parse(JSON.stringify(value));
                    return resolve(output[0].count);
                }
            );
        });
    };

    // Extract parameters from the event
    const { action, username, password } = event;

    let response;

    try {
        if (action === 'check-admin') {
            // Check number of admins in the database
            const numOfAdmin = await CountAdmin();
            response = {
                statusCode: 200,
                numOfAdmin: numOfAdmin,
            };
        } else if (action === 'sign-up') {
            // Admin Sign-Up Logic
            const numOfAdmin = await CountAdmin();
            if (numOfAdmin >= 1) {
                response = {
                    statusCode: 400,
                    error: "An admin account already exists. No more admins can be created.",
                };
            } else {
                const createdAdmin = await CreateAdmin(username, password);
                response = {
                    statusCode: 200,
                    admin: {
                        username,
                        password,
                    },
                    success: "New Admin Created",
                };
            }
        } else if (action === 'log-in') {
            // Admin Log-In Logic
            const numOfAdmin = await CountAdmin();
            if (numOfAdmin === 0) {
                response = {
                    statusCode: 400,
                    error: "No admin account exists. Please sign up first.",
                };
            } else {
                const isAdmin = await CheckAdmin(username, password);
                if (isAdmin > 0) {
                    response = {
                        statusCode: 200,
                        result: {
                            username,
                            password,
                        },
                        success: "Correct Admin Credentials",
                    };
                } else {
                    response = {
                        statusCode: 400,
                        error: "Invalid Admin Credentials",
                    };
                }
            }
        } else {
            // Invalid Action
            response = {
                statusCode: 400,
                error: "Invalid action specified. Use 'sign-up', 'log-in', or 'check-admin'.",
            };
        }
    } catch (error) {
        console.error("Error in Lambda function:", error);
        response = {
            statusCode: 500,
            error: "An unexpected error occurred.",
        };
    } finally {
        pool.end(); // Close DB connections
    }

    return response;
};
