/**
 * One-time worker account seeder.
 *
 * Creates MAX_WORKERS pre-seeded user accounts on the target environment and prints
 * the WORKER_N_EMAIL / WORKER_N_PASSWORD values to stdout.
 *
 * Usage:
 *   npm run seed:workers
 *
 * After running:
 *   - Copy WORKER_N_EMAIL values into .env.local (committed per-environment, non-secret)
 *   - Copy WORKER_N_PASSWORD values into GitHub Secrets (never commit passwords)
 */
import { HttpClient } from '@framework/api-client';
import { CreateUserResponseSchema } from '@framework/contracts';
import { EnvironmentConfig } from '../src/config/EnvironmentConfig';
import { RandomDataGenerator } from '../src/data/generators/RandomDataGenerator';
import { UserBuilder } from '../src/data/builders/UserBuilder';

async function toFormData(data: Record<string, string>): Promise<FormData> {
  const fd = new FormData();
  for (const [key, value] of Object.entries(data)) {
    fd.append(key, value);
  }
  return fd;
}

async function seedWorkers(): Promise<void> {
  const { maxWorkers, apiBaseUrl } = EnvironmentConfig;
  const client = new HttpClient({ baseUrl: apiBaseUrl });

  // Fixed seed produces the same accounts on repeated runs — useful for re-seeding.
  // Change the seed number to generate a fresh set when rotating credentials.
  const generator = new RandomDataGenerator(0xdeadbeef);

  console.log(`Seeding ${maxWorkers} worker accounts against ${apiBaseUrl}...\n`);

  const emailLines: string[] = [];
  const passwordLines: string[] = [];

  for (let i = 0; i < maxWorkers; i++) {
    const payload = UserBuilder.defaults(generator).build();
    const fd = await toFormData(payload as unknown as Record<string, string>);

    const response = await client.postMultipart('/api/createAccount', fd, {
      schema: CreateUserResponseSchema,
    });

    if (response.body.responseCode === 201) {
      emailLines.push(`WORKER_${i}_EMAIL=${payload.email}`);
      passwordLines.push(`WORKER_${i}_PASSWORD=${payload.password}`);
      console.log(`  ✓ Worker ${i}: ${payload.email}`);
    } else {
      console.error(
        `  ✗ Worker ${i}: responseCode=${response.body.responseCode} — ${response.body.message}`,
      );
      process.exit(1);
    }
  }

  console.log('\n--- .env.local (emails — safe to commit) ---');
  console.log(emailLines.join('\n'));

  console.log('\n--- GitHub Secrets (passwords — never commit) ---');
  console.log(passwordLines.join('\n'));

  console.log('\nDone. Add the above values to the appropriate locations.');
}

seedWorkers().catch((err: unknown) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
