import { randomUUID } from 'crypto';

export class UserId {
  private static readonly UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  private constructor(private readonly _value: string) {
    Object.freeze(this);
  }

  static create(id: string): UserId {
    const trimmedId = id.trim().toLowerCase();

    if (!this.UUID_REGEX.test(trimmedId)) {
      throw new Error('Invalid UUID format');
    }

    return new UserId(trimmedId);
  }

  static generate(): UserId {
    return new UserId(randomUUID());
  }

  get value(): string {
    return this._value;
  }

  equals(other: UserId): boolean {
    if (!other || !(other instanceof UserId)) {
      return false;
    }
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
