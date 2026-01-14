export interface IPasswordHasher {
  /**
   * Hashes a plain text password
   */
  hash(plainPassword: string): Promise<string>;

  /**
   * Compares a plain text password with a hashed password
   */
  compare(plainPassword: string, hashedPassword: string): Promise<boolean>;
}
