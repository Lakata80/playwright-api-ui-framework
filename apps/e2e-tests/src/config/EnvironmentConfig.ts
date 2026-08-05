import path from 'path';
import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';
import type { LogLevel } from '@framework/api-client';

const ENV_DIR = path.join(__dirname, 'environments');
const activeEnv = process.env['ENV'] ?? 'staging';

// Load environment-specific non-secret vars first, then let .env.local override.
loadDotenv({ path: path.join(ENV_DIR, `.env.${activeEnv}`), override: false });
loadDotenv({ path: path.join(ENV_DIR, '.env.local'), override: true });

const ConfigSchema = z.object({
  env: z.enum(['staging', 'production', 'local']).default('staging'),
  apiBaseUrl: z.string().url(),
  uiBaseUrl: z.string().url(),
  logLevel: z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR'] as [LogLevel, ...LogLevel[]]).default('INFO'),
  maxWorkers: z.coerce.number().int().positive().default(4),
  allureResultsDir: z.string().optional(),
});

type Config = z.infer<typeof ConfigSchema>;

function buildConfig(): Config {
  const result = ConfigSchema.safeParse({
    env: process.env['ENV'],
    apiBaseUrl: process.env['API_BASE_URL'],
    uiBaseUrl: process.env['UI_BASE_URL'],
    logLevel: process.env['LOG_LEVEL'],
    maxWorkers: process.env['MAX_WORKERS'],
    allureResultsDir: process.env['ALLURE_RESULTS_DIR'],
  });

  if (!result.success) {
    const lines = result.error.issues
      .map((i) => `  ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new Error(
      `Environment configuration invalid — check your .env.local and .env.${activeEnv} files:\n${lines}`,
    );
  }

  return result.data;
}

export interface WorkerCredentials {
  readonly email: string;
  readonly password: string;
}

const _config = buildConfig();

/**
 * Typed, validated environment configuration.
 *
 * All process.env access is centralised here — no other module reads process.env directly.
 * Worker credentials are resolved lazily so missing vars surface at test runtime, not at
 * module load time (allows running tests that don't use auth without seeding accounts).
 */
export const EnvironmentConfig = Object.freeze({
  env: _config.env,
  apiBaseUrl: _config.apiBaseUrl,
  uiBaseUrl: _config.uiBaseUrl,
  logLevel: _config.logLevel,
  maxWorkers: _config.maxWorkers,
  allureResultsDir: _config.allureResultsDir,

  getWorkerCredentials(workerIndex: number): WorkerCredentials {
    const email = process.env[`WORKER_${workerIndex}_EMAIL`];
    const password = process.env[`WORKER_${workerIndex}_PASSWORD`];

    if (!email || !password) {
      throw new Error(
        `Missing credentials for worker ${workerIndex}.\n` +
          `Set WORKER_${workerIndex}_EMAIL and WORKER_${workerIndex}_PASSWORD in .env.local.\n` +
          `Run 'npm run seed:workers' to create the pre-seeded accounts.`,
      );
    }

    return { email, password };
  },
});
