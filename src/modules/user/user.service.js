import { AppError } from '#src/middlewares/error-handler.js';
import { query } from '#src/db/index.js';

const UNIQUE_VALIDATION = '23505';

const USER_COLUMNS = 'id, name, email, created_at as "createdAt", updated_at as "updatedAt" ';

export const clearUsers = async () => {
  await query('truncate table users');
};

export const userService = {
  // Get all users
  getAllUsers: async () => {
    const { rows } = await query(`select ${USER_COLUMNS} from users order by created_at asc`);
    return rows;
  },

  // Get user by ID
  getUserById: async (id) => {
    const { rows } = await query(`select ${USER_COLUMNS} from users where id=$1`, [id]);
    if (rows.length === 0) {
      throw new AppError('User not found', 404);
    }
    return rows[0];
  },

  // Create user
  createUser: async (data) => {
    try {
      const { rows } = await query(`insert into users(name, email) values ($1, $2) returning ${USER_COLUMNS}`, [data.name, data.email]);
      return rows[0];
    } catch (error) {
      if (error.code === UNIQUE_VALIDATION) {
        throw new AppError('User with this email already exists', 409);
      }
      throw error;
    }
  },

  // Delete user
  deleteUser: async (id) => {
    const { rowCount } = await query('delete from users where id=$1', [id]);
    if (rowCount === 0) {
      throw new AppError('User not found', 404);
    }
  },
};
