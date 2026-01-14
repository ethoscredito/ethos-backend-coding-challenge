import { UserId } from '../value-objects/UserId';
import { Email } from '../value-objects/Email';
import { Password } from '../value-objects/Password';

export class User {
  private constructor(
    private readonly _id: UserId,
    private _email: Email,
    private _name: string,
    private _hashedPassword: string,
    private readonly _createdAt: Date,
    private _updatedAt: Date
  ) {
    this.validateName(_name);
  }

  static async create(email: Email, name: string, password: Password): Promise<User> {
    const id = UserId.generate();
    const trimmedName = name.trim();
    const hashedPassword = await password.hash();
    const now = new Date();

    return new User(id, email, trimmedName, hashedPassword, now, now);
  }

  static reconstitute(
    id: UserId,
    email: Email,
    name: string,
    hashedPassword: string,
    createdAt: Date,
    updatedAt: Date
  ): User {
    return new User(id, email, name.trim(), hashedPassword, createdAt, updatedAt);
  }

  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('User name cannot be empty');
    }
  }

  async verifyPassword(plainPassword: string): Promise<boolean> {
    return Password.compare(plainPassword, this._hashedPassword);
  }

  updateProfile(email: Email, name: string): void {
    const trimmedName = name.trim();
    this.validateName(trimmedName);

    this._email = email;
    this._name = trimmedName;
    this._updatedAt = new Date();
  }

  async updatePassword(password: Password): Promise<void> {
    this._hashedPassword = await password.hash();
    this._updatedAt = new Date();
  }

  equals(other: User): boolean {
    if (!other || !(other instanceof User)) {
      return false;
    }
    return this._id.equals(other._id);
  }

  get id(): UserId {
    return this._id;
  }

  get email(): Email {
    return this._email;
  }

  get name(): string {
    return this._name;
  }

  get hashedPassword(): string {
    return this._hashedPassword;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
