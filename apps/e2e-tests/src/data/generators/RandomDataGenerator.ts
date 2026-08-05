/**
 * Deterministic pseudo-random data generator using a 32-bit LCG.
 *
 * Pass a fixed seed to reproduce a specific sequence across runs:
 *   new RandomDataGenerator(42)
 *
 * Omit the seed for a time-based sequence suitable for unique test data.
 */
export class RandomDataGenerator {
  private seed: number;

  constructor(seed?: number) {
    this.seed = (seed ?? Date.now()) >>> 0;
  }

  private next(): number {
    // Park-Miller LCG — keeps seed as unsigned 32-bit integer
    this.seed = ((this.seed * 1664525 + 1013904223) & 0xffffffff) >>> 0;
    return this.seed / 0x100000000;
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  private randomChar(chars: string): string {
    const ch = chars[this.randomInt(0, chars.length - 1)];
    return ch ?? 'a';
  }

  private randomString(length: number, chars: string): string {
    return Array.from({ length }, () => this.randomChar(chars)).join('');
  }

  /** Generates a unique email address suitable for account creation. */
  email(domain = 'testframe.dev'): string {
    const local = `user_${this.randomString(10, 'abcdefghijklmnopqrstuvwxyz0123456789')}`;
    return `${local}@${domain}`;
  }

  /** Generates a password that satisfies most common password policies. */
  password(length = 14): string {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
    const special = '!@#$%';
    const all = upper + lower + digits + special;
    // Guarantee at least one of each required character class
    const mandatory = [
      this.randomChar(upper),
      this.randomChar(lower),
      this.randomChar(digits),
      this.randomChar(special),
    ];
    const rest = Array.from({ length: length - 4 }, () => this.randomChar(all));
    return [...mandatory, ...rest].sort(() => this.next() - 0.5).join('');
  }

  firstName(): string {
    const names = ['Alice', 'Bob', 'Carol', 'David', 'Emma', 'Frank', 'Grace', 'Henry', 'Iris'];
    return names[this.randomInt(0, names.length - 1)] ?? 'Test';
  }

  lastName(): string {
    const surnames = ['Smith', 'Jones', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore'];
    return surnames[this.randomInt(0, surnames.length - 1)] ?? 'User';
  }

  phone(): string {
    return `555${this.randomInt(1000000, 9999999)}`;
  }

  address(): {
    address1: string;
    address2: string;
    city: string;
    state: string;
    zipcode: string;
    country: string;
  } {
    return {
      address1: `${this.randomInt(100, 9999)} Test Street`,
      address2: `Apt ${this.randomInt(1, 99)}`,
      city: 'Testville',
      state: 'California',
      zipcode: `${this.randomInt(10000, 99999)}`,
      country: 'United States',
    };
  }

  /** Returns a random item from an array. */
  pick<T>(items: readonly [T, ...T[]]): T {
    const item = items[this.randomInt(0, items.length - 1)];
    return item ?? items[0];
  }
}
