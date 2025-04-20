// Import required modules
import pg from 'pg'; // PostgreSQL client library
import dotenv from 'dotenv'; // Environment variable loader

// Load environment variables from .env file
dotenv.config();

// Destructure Pool from pg module
const { Pool } = pg;

// Create a new PostgreSQL connection pool with configuration from environment variables
const pool = new Pool({
  user: process.env.DB_USER,          // Database username
  host: process.env.DB_HOST,          // Database host address
  database: process.env.DB_NAME,      // Database name
  password: process.env.DB_PASSWORD,  // Database password
  port: process.env.DB_PORT,          // Database port
});

// Attempt to connect to the database to verify the connection
pool.connect((err, client, release) => { 
    if (err) { 
       // Log error if connection fails
       return console.error('Error acquiring client', err.stack); 
    } 
    // Log success message on successful connection
    console.log('Connected to PostgreSQL database'); 
    // Release the client back to the pool
    release();
});

// Handle unexpected errors on idle clients in the pool
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1); 
});

// Export a query function that uses the pool
export const query = (text, params) => pool.query(text, params);

// Export the pool object for direct use if needed
export { pool };