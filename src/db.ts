import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: 'jules',
  host: 'localhost',
  database: 'quran_db',
  password: 'password',
  port: 5432,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
