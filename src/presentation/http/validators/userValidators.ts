import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required').trim(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').trim().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters long').optional(),
}).refine(
  (data) => data.name !== undefined || data.password !== undefined,
  { message: 'At least one field (name or password) must be provided' }
);

export const userIdParamSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
});

export type CreateUserRequest = z.infer<typeof createUserSchema>;
export type UpdateUserRequest = z.infer<typeof updateUserSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
