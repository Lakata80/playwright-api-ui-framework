import type { CreateUserRequest } from '@framework/contracts';
import { RandomDataGenerator } from '../generators/RandomDataGenerator';
import { UserBuilder } from '../builders/UserBuilder';

/**
 * Convenience factory combining UserBuilder + RandomDataGenerator.
 *
 * Usage:
 *   const factory = new UserFactory();
 *   const payload = factory.createPayload();                    // fully random
 *   const custom  = factory.createPayload({ title: 'Mrs' });   // partial override
 */
export class UserFactory {
  private readonly generator: RandomDataGenerator;

  constructor(seed?: number) {
    this.generator = new RandomDataGenerator(seed);
  }

  createPayload(overrides?: Partial<CreateUserRequest>): CreateUserRequest {
    const base = UserBuilder.defaults(this.generator).build();
    if (!overrides) return base;
    return { ...base, ...overrides };
  }
}
