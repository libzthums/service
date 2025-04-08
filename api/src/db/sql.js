const sql = require("mssql");
require("dotenv").config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
  port: 1433,
};

let poolPromise;

async function connectDB() {
  if (!poolPromise) {
    try {
      poolPromise = new sql.ConnectionPool(config);
      await poolPromise.connect();
      console.log("Connected to MSSQL");
    } catch (error) {
      console.error("Database connection failed:", error);
      throw error;
    }
  }
  return poolPromise;
}

async function connectAndQuery(query) {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(query);
    return result.recordset;
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  }
}

module.exports = {
  connectDB,
  connectAndQuery,
  sql,
};