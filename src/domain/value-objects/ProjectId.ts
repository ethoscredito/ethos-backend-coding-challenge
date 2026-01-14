import { randomUUID } from 'crypto';

export class ProjectId {
  private static readonly UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  private constructor(private readonly _value: string) {
    Object.freeze(this);
  }

  static create(id: string): ProjectId {
    const trimmedId = id.trim().toLowerCase();

    if (!this.UUID_REGEX.test(trimmedId)) {
      throw new Error('Invalid UUID format');
    }

    return new ProjectId(trimmedId);
  }

  static generate(): ProjectId {
    return new ProjectId(randomUUID());
  }

  get value(): string {
    return this._value;
  }

  equals(other: ProjectId): boolean {
    if (!other || !(other instanceof ProjectId)) {
      return false;
    }
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
