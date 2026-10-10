import { z } from 'zod';

export const listUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).default(5),
    name: z.string().trim().min(1).optional(),
  }),
});

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50),
    email: z.email('Invalid email address'),
  }),
});

export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.uuid('Invalid user ID'),
  }),
});

export const deleteUserSchema = z.object({
  params: z.object({
    id: z.uuid('Invalid user ID'),
  }),
});
