export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const SENSITIVE_HEADERS = new Set([
  'authorization',
  'cookie',
  'x-api-key',
  'x-auth-token',
  'x-session-token',
]);

/**
 * Thin structured logger. Emits JSON lines to stdout/stderr.
 * Sensitive headers are redacted before logging — never log bearer tokens or cookies.
 */
export class Logger {
  constructor(
    private readonly minLevel: LogLevel = 'INFO',
    private readonly context?: string,
  ) {}

  debug(message: string, data?: Record<string, unknown>): void {
    this.emit('DEBUG', message, data);
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.emit('INFO', message, data);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.emit('WARN', message, data);
  }

  error(message: string, data?: Record<string, unknown>): void {
    this.emit('ERROR', message, data);
  }

  static redactHeaders(headers: Record<string, string>): Record<string, string> {
    const redacted: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
      redacted[key] = SENSITIVE_HEADERS.has(key.toLowerCase()) ? '[REDACTED]' : value;
    }
    return redacted;
  }

  private emit(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[this.minLevel]) return;

    const entry: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };
    if (this.context) entry['context'] = this.context;
    if (data) entry['data'] = data;

    const line = JSON.stringify(entry);
    if (level === 'ERROR' || level === 'WARN') {
      console.error(line);
    } else {
      console.log(line);
    }
  }
}
