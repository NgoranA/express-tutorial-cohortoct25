import { describe, it, expect, beforeEach, afterAll } from '@jest/globals';
import { userService, clearUsers } from './user.service.js';
import { AppError } from '#src/middlewares/error-handler.js';
import { pool } from '#src/db/index.js';
import crypto from 'node:crypto';

describe('UserService', () => {
  beforeEach(async () => {
    await clearUsers();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('getAllUsers', () => {
    it('should return all users when users exist', async () => {
      const user1Data = {
        name: 'John Doe',
        email: 'john@example.com',
      };
      const user2Data = {
        name: 'Jane Smith',
        email: 'jane@example.com',
      };

      await userService.createUser(user1Data);
      await userService.createUser(user2Data);

      const { users } = await userService.getAllUsers();
      expect(users).toHaveLength(2);
      expect(users[0]?.name).toBe('John Doe');
      expect(users[1]?.name).toBe('Jane Smith');
    });
  });

  describe('getUserById', () => {
    it('should return a user when found by ID', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const createdUser = await userService.createUser(userData);
      const foundUser = await userService.getUserById(createdUser.id);

      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe(createdUser.id);
      expect(foundUser.name).toBe('John Doe');
      expect(foundUser.email).toBe('john@example.com');
    });

    it('should throw AppError with 404 when user not found', async () => {
      const nonExistentId = crypto.randomUUID();

      await expect(userService.getUserById(nonExistentId)).rejects.toThrow(AppError);
      await expect(userService.getUserById(nonExistentId)).rejects.toThrow('User not found');

      try {
        await userService.getUserById(nonExistentId);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(404);
      }
    });
  });

  describe('createUser', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const createdUser = await userService.createUser(userData);

      expect(createdUser).toBeDefined();
      expect(createdUser.id).toBeDefined();
      expect(createdUser.name).toBe('John Doe');
      expect(createdUser.email).toBe('john@example.com');
      expect(createdUser.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('pagination and search', () => {
    beforeEach(async () => {
      for (const name of ['alice', 'aristide', 'kiera', 'pavellt', 'jonathan', 'karl', 'alvin']) {
        await userService.createUser({ name, email: `${name.toLowerCase()}@gmail.com` });
      }
    });

    it('should return the requested page with meta', async () => {
      const { users, meta } = await userService.getAllUsers({ page: 2, limit: 2 });
      expect(users.map((u) => u.name)).toEqual(['kiera', 'pavellt']);
      expect(meta).toEqual({ page: 2, limit: 2, total: 7, totalPages: 4 });
    });
    //
    it('should filter users by name(case-insensitiev, partial match)', async () => {
      const { users, meta } = await userService.getAllUsers({ name: 'ari' });
      expect(users.map((u) => u.name)).toEqual(['aristide']);
      expect(meta.total).toBe(1);
    });
  });

  describe('UpdateUser', () => {
    it('should update only the provided fields', async () => {
      const created = await userService.createUser({ name: 'Kiera tyson', email: 'kierat@gmail.com' });
      const updated = await userService.updateUser(created.id, { name: 'Kiera Smith' });

      expect(updated.name).toBe('Kiera Smith');
      expect(updated.email).toBe('kierat@gmail.com');
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(created.updatedAt.getTime());
    });

    it('should throw 404 when user does not exist', async () => {
      await expect(userService.updateUser(crypto.randomUUID(), { name: 'Nobody' })).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it('should throw when email is taken by another user', async () => {
      await userService.createUser({ name: 'smith', email: 'smith@stubborn.com' });
      const russel = await userService.createUser({ name: 'russel', email: 'russel@absent.com' });

      await expect(userService.updateUser(russel.id, { email: 'smith@stubborn.com' })).rejects.toMatchObject({
        statusCode: 409,
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete an existing user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const createdUser = await userService.createUser(userData);
      const { users: usersBefore } = await userService.getAllUsers();
      expect(usersBefore).toHaveLength(1);

      await userService.deleteUser(createdUser.id);

      const { users: usersAfter } = await userService.getAllUsers();
      expect(usersAfter).toHaveLength(0);
    });

    it('should throw AppError with 404 when deleting non-existent user', async () => {
      const nonExistentId = crypto.randomUUID();

      await expect(userService.deleteUser(nonExistentId)).rejects.toThrow(AppError);
      await expect(userService.deleteUser(nonExistentId)).rejects.toThrow('User not found');

      try {
        await userService.deleteUser(nonExistentId);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(404);
      }
    });
  });
});
