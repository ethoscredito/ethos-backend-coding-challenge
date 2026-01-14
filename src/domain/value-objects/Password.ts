import * as bcrypt from 'bcrypt';

export class Password {
  private static readonly MIN_LENGTH = 8;
  private static readonly SALT_ROUNDS = 10;

  private constructor(private readonly _value: string) {
    Object.freeze(this);
  }

  static create(password: string): Password {
    const trimmedPassword = password.trim();

    if (trimmedPassword.length < this.MIN_LENGTH) {
      throw new Error(`Password must be at least ${this.MIN_LENGTH} characters long`);
    }

    return new Password(trimmedPassword);
  }

  get value(): string {
    return this._value;
  }

  async hash(): Promise<string> {
    return bcrypt.hash(this._value, Password.SALT_ROUNDS);
  }

  static async compare(plainPassword: string, hashedPassword: string): Promise<boolean> {
    console.log(plainPassword, hashedPassword, await bcrypt.compare(plainPassword, hashedPassword));
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  equals(other: Password): boolean {
    if (!other || !(other instanceof Password)) {
      return false;
    }
    return this._value === other._value;
  }
}
