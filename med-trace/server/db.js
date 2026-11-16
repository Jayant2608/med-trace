import 'dotenv/config';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'medtrace',
  database: process.env.DB_NAME || 'medicine_traceability',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
  multipleStatements: false,
});

// Accounts live in their own database (see db/auth.sql) so the traceability
// schema stays the 12 tables the ER diagram shows.
export const authPool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'medtrace',
  database: process.env.AUTH_DB_NAME || 'medtrace_auth',
  waitForConnections: true,
  connectionLimit: 5,
  dateStrings: true,
  multipleStatements: false,
});

export default pool;
