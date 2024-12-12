import mysql from 'mysql';

console.log("Start");

export const handler = async (event) => {
    console.log("Received event:", event);

    // Create a MySQL connection pool
    const pool = mysql.createPool({
        host: "food4udb.cfw68i0key7z.us-east-1.rds.amazonaws.com",
        user: "food4uAdmin",
        password: "food4uPass",
        database: "Food4U",
    });

    // Function to check if the username already exists
    const IsUsernameRegistered = (username) => {
        return new Promise((resolve, reject) => {
            pool.query(
                "SELECT username FROM manager WHERE username = ?;",
                [username],
                (error, result) => {
                    if (error) {
                        console.error("Error checking username:", error);
                        return reject(error);
                    }
                    return resolve(result.length > 0); // Returns true if the username exists
                }
            );
        });
    };

    // Function to create a new manager
    const CreateManager = (username, password) => {
        return new Promise((resolve, reject) => {
            pool.query(
                "INSERT INTO manager (username, password) VALUES (?, ?);",
                [username, password],
                (error, rows) => {
                    if (error) return reject(error);
                    return resolve('New Manager Created');
                }
            );
        });
    };

    // Function to log in a manager
    const LogInManager = (username, password) => {
        return new Promise((resolve, reject) => {
            pool.query(
                "SELECT * FROM manager WHERE username = ? AND password = ?;",
                [username, password],
                (error, result) => {
                    if (error) {
                        console.error("Error during log in:", error);
                        return reject(error);
                    }
                    if (result.length > 0) {
                        return resolve({ message: 'Correct Manager Credentials', manager: result[0] });
                    }
                    return resolve({ message: 'Invalid credentials' });
                }
            );
        });
    };

    try {
        // Extract action, username, and password from the event
        const { action, username, password } = event;

        // Validate input
        if (!username || !password || !action) {
            return {
                statusCode: 400,
                message: 'Invalid input parameters.',
            };
        }

        if (action === 'check-manager-username') {
            // Check if username already exists
            const usernameExists = await IsUsernameRegistered(username);
            return {
                statusCode: 200,
                usernameExists,
            };
        } else if (action === 'log-in') {
            // Log-in logic
            const loginResult = await LogInManager(username, password);
            if (loginResult.message === "Correct Manager Credentials") {
                return {
                    statusCode: 200,
                    message: loginResult.message,
                    manager: loginResult.manager, // Return manager details
                };
            } else {
                return {
                    statusCode: 401,
                    message: loginResult.message, // "Invalid credentials"
                };
            }
        } else if (action === 'sign-up') {
            // Check if username already exists
            const usernameExists = await IsUsernameRegistered(username);
            if (usernameExists) {
                return {
                    statusCode: 400,
                    message: 'The username is already registered for a manager. Please choose a different username.',
                };
            }

            // Sign-up logic
            const message = await CreateManager(username, password);
            return {
                statusCode: 200,
                message,
            };
        } else {
            return {
                statusCode: 400,
                message: "Invalid action. Use 'log-in', 'sign-up', or 'check-manager-username'.",
            };
        }
    } catch (error) {
        console.error("Error handling request:", error);
        return {
            statusCode: 500,
            message: "Internal server error.",
        };
    } finally {
        // Close the pool connections
        pool.end((err) => {
            if (err) console.error("Error closing the database connection pool:", err);
        });
    }
};
