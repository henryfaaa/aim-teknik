import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

let pool;

if (process.env.DATABASE_URL) {
  // Railway production
  pool = mysql.createPool(process.env.DATABASE_URL);
} else {
  // Local development
  pool = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "aimteknik",

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    dateStrings: true,
  });
}

export default pool;

export async function assertDB() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log("✅ DB connected");
  } catch (e) {
    console.error("❌ DB connect failed:", e.message || e);
  }
}