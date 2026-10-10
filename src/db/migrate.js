import { readFile } from 'node:fs/promises';
import { logger } from '#src/middlewares/logger.js';
import { pool } from './index.js';

const sql = await readFile(new URL('./schema.sql', import.meta.url), 'utf8');
await pool.query(sql);
logger.info('Schema applied');
await pool.end();
