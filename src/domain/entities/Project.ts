import { ProjectId } from '../value-objects/ProjectId';
import { UserId } from '../value-objects/UserId';

export class Project {
  private constructor(
    private readonly _id: ProjectId,
    private _name: string,
    private _description: string | null,
    private readonly _userId: UserId,
    private readonly _createdAt: Date,
    private _updatedAt: Date
  ) {
    this.validateName(_name);
  }

  static create(name: string, description: string | null, userId: UserId): Project {
    const id = ProjectId.generate();
    const trimmedName = name.trim();
    const trimmedDescription = this.normalizeDescription(description);
    const now = new Date();

    return new Project(id, trimmedName, trimmedDescription, userId, now, now);
  }

  static reconstitute(
    id: ProjectId,
    name: string,
    description: string | null,
    userId: UserId,
    createdAt: Date,
    updatedAt: Date
  ): Project {
    const trimmedName = name.trim();
    const trimmedDescription = this.normalizeDescription(description);

    return new Project(id, trimmedName, trimmedDescription, userId, createdAt, updatedAt);
  }

  private static normalizeDescription(description: string | null): string | null {
    if (description === null || description === undefined) {
      return null;
    }

    const trimmed = description.trim();
    return trimmed.length === 0 ? null : trimmed;
  }

  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Project name cannot be empty');
    }
  }

  update(name: string, description: string | null): void {
    const trimmedName = name.trim();
    this.validateName(trimmedName);

    const trimmedDescription = Project.normalizeDescription(description);

    this._name = trimmedName;
    this._description = trimmedDescription;
    this._updatedAt = new Date();
  }

  belongsToUser(userId: UserId): boolean {
    return this._userId.equals(userId);
  }

  equals(other: Project): boolean {
    if (!other || !(other instanceof Project)) {
      return false;
    }
    return this._id.equals(other._id);
  }

  get id(): ProjectId {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | null {
    return this._description;
  }

  get userId(): UserId {
    return this._userId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
