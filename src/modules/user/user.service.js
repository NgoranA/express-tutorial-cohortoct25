import { AppError } from '#src/middlewares/error-handler.js';
import { query } from '#src/db/index.js';

const UNIQUE_VALIDATION = '23505';

const USER_COLUMNS = 'id, name, email, created_at as "createdAt", updated_at as "updatedAt" ';

export const clearUsers = async () => {
  await query('truncate table users');
};

export const userService = {
  // Get all users
  getAllUsers: async ({ page = 1, limit = 5, name } = {}) => {
    const offset = (page - 1) * limit;
    const search = name ? `%${name}%` : null;

    const where = `where ($1::text is null or name ilike $1)`;

    const [rows, count] = await Promise.all([
      query(`select ${USER_COLUMNS} from users ${where} order by created_at asc limit $2 offset $3`, [search, limit, offset]),
      query(`select count(*)::int as total from users ${where}`, [search]),
    ]);

    const total = count.rows[0].total;

    return {
      users: rows.rows,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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

  // update user( partial updates)
  updateUser: async (id, data) => {
    const allowed = ['name', 'email'];
    const fields = allowed.filter((key) => data[key] !== undefined);

    if (fields.length === 0) {
      throw new AppError('No fields to update', 400);
    }

    const setClause = fields.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = fields.map((key) => data[key]);

    try {
      const { rows } = await query(
        `update users set ${setClause}, updated_at = now() where id = $${fields.length + 1} returning ${USER_COLUMNS}`,
        [...values, id],
      );
      if (rows.length === 0) {
        throw new AppError('User not found', 404);
      }
      return rows[0];
    } catch (error) {
      if (error.code === UNIQUE_VALIDATION) {
        throw new AppError('User with email already exists', 409);
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
