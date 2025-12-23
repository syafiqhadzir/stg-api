/* v8 ignore file */
import { buildApp } from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = parseInt(process.env.PORT ?? '3000');
const app = buildApp();

const start = async () => {
  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Server running on port ${String(PORT)}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

void start();
