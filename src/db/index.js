import pg from 'pg';

import { ENV } from '#src/config/env.js';

export const pool = new pg.Pool({
  connectionString: ENV.DATABASE_URL,
});

export const query = (text, params) => pool.query(text, params);
