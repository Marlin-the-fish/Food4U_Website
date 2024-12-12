import mysql from "mysql2";

// Database configuration
const pool = mysql.createPool({
  host: "food4udb.cfw68i0key7z.us-east-1.rds.amazonaws.com",
  user: "food4uAdmin",
  password: "food4uPass",
  database: "Food4U",
}).promise();

// Function to generate a unique ID
function generateUniqueId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
}

export const handler = async (event) => {
  console.log("Received event:", event);

  // Parse input directly from event
  const { name, email } = event;

  // Validate required fields
  if (!name || !email) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Missing required fields: name and email.",
      }),
    };
  }

  try {
    // Generate a unique idUser
    const idUser = generateUniqueId();
    console.log("Generated idUser:", idUser);

    // Insert the user into the database
    const query = `
      INSERT INTO user (idUser, name, email)
      VALUES (?, ?, ?)
    `;
    await pool.execute(query, [idUser, name, email]);
    console.log("User inserted successfully:", { idUser, name, email });

    // Return success response
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "User created successfully",
        data: { idUser, name, email },
      }),
    };
  } catch (error) {
    console.error("Error inserting user into database:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error.",
        error: error.message,
      }),
    };
  }
};
