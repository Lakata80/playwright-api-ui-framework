import type { CreateUserRequest } from '@framework/contracts';
import { RandomDataGenerator } from '../generators/RandomDataGenerator';

/**
 * Immutable fluent builder for CreateUserRequest payloads.
 *
 * Usage:
 *   const payload = UserBuilder.defaults(generator)
 *     .withEmail('custom@example.com')
 *     .withTitle('Mrs')
 *     .build();
 *
 * Each with*() returns a new builder instance — the original is unchanged.
 */
export class UserBuilder {
  private constructor(private readonly data: CreateUserRequest) {}

  /** Creates a builder pre-filled with randomly generated valid data. */
  static defaults(generator = new RandomDataGenerator()): UserBuilder {
    const first = generator.firstName();
    const last = generator.lastName();
    const addr = generator.address();

    return new UserBuilder({
      name: `${first} ${last}`,
      email: generator.email(),
      password: generator.password(),
      title: generator.pick(['Mr', 'Mrs']),
      birth_date: String(
        generator.pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] as const),
      ),
      birth_month: String(generator.pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const)),
      birth_year: String(1970 + Math.floor(Math.random() * 35)),
      firstname: first,
      lastname: last,
      company: 'TestCo',
      address1: addr.address1,
      address2: addr.address2,
      city: addr.city,
      state: addr.state,
      zipcode: addr.zipcode,
      country: addr.country,
      mobile_number: generator.phone(),
    });
  }

  withEmail(email: string): UserBuilder {
    return new UserBuilder({ ...this.data, email });
  }

  withPassword(password: string): UserBuilder {
    return new UserBuilder({ ...this.data, password });
  }

  withTitle(title: 'Mr' | 'Mrs'): UserBuilder {
    return new UserBuilder({ ...this.data, title });
  }

  withName(firstname: string, lastname: string): UserBuilder {
    return new UserBuilder({
      ...this.data,
      name: `${firstname} ${lastname}`,
      firstname,
      lastname,
    });
  }

  withAddress(
    partial: Partial<
      Pick<CreateUserRequest, 'address1' | 'city' | 'state' | 'zipcode' | 'country'>
    >,
  ): UserBuilder {
    return new UserBuilder({ ...this.data, ...partial });
  }

  build(): CreateUserRequest {
    return this.data;
  }
}
