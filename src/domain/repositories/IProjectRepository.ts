import { Project } from '../entities/Project';
import { ProjectId } from '../value-objects/ProjectId';
import { UserId } from '../value-objects/UserId';

/**
 * Project Repository Interface (Port)
 *
 * Defines the contract for project persistence operations in the domain layer.
 * This is a port in the hexagonal architecture - implementations will be adapters
 * in the infrastructure layer.
 */
export interface IProjectRepository {
  /**
   * Find a project by its unique ID
   * @param id - The project's ID
   * @returns The project if found, null otherwise
   */
  findById(id: ProjectId): Promise<Project | null>;

  /**
   * Find all projects belonging to a specific user
   * @param userId - The user's ID
   * @returns Array of projects belonging to the user
   */
  findByUserId(userId: UserId): Promise<Project[]>;

  /**
   * Get all projects
   * @returns Array of all projects
   */
  findAll(): Promise<Project[]>;

  /**
   * Save a new project or update an existing one
   * @param project - The project to save
   * @returns The saved project
   */
  save(project: Project): Promise<Project>;

  /**
   * Delete a project by its ID
   * @param id - The project's ID
   * @returns True if deleted, false if not found
   */
  delete(id: ProjectId): Promise<boolean>;
}
