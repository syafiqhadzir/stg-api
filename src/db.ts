import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'quran_db',
});

// Event listener for unexpected errors on idle clients
// Event listener for unexpected errors on idle clients
pool.on('error', (err, _client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const query = async (text: string, params?: any[]) => {
  const res = await pool.query(text, params);
  // console.log('executed query', { text, rows: res.rowCount });
  return res;
};

export const getClient = () => pool.connect();
