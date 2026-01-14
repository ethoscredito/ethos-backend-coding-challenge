import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').trim(),
  description: z.string().trim().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1, 'Project name cannot be empty').trim().optional(),
  description: z.string().trim().optional(),
}).refine(
  (data) => data.name !== undefined || data.description !== undefined,
  { message: 'At least one field (name or description) must be provided' }
);

export const projectIdParamSchema = z.object({
  id: z.string().uuid('Invalid project ID format'),
});

export type CreateProjectRequest = z.infer<typeof createProjectSchema>;
export type UpdateProjectRequest = z.infer<typeof updateProjectSchema>;
export type ProjectIdParam = z.infer<typeof projectIdParamSchema>;
