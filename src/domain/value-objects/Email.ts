export class Email {
  private constructor(private readonly _value: string) {}

  static create(email: string): Email {
    const normalized = email.toLowerCase().trim();
    if (!this.isValid(normalized)) {
      throw new Error('Invalid email format');
    }
    return new Email(normalized);
  }

  private static isValid(email: string): boolean {
    if (!email || email.trim().length === 0) {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  get value(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }
}
