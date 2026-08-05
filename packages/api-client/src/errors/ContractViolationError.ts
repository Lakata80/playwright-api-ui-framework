import type { ZodIssue } from 'zod';

/**
 * Thrown by ValidationInterceptor when the response body does not satisfy the
 * Zod schema provided at the call site. Contains the full Zod issue list for
 * debugging schema drift.
 */
export class ContractViolationError extends Error {
  constructor(
    public readonly url: string,
    public readonly issues: readonly ZodIssue[],
  ) {
    const summary = issues.map((issue) => `[${issue.path.join('.')}] ${issue.message}`).join('; ');
    super(`Contract violation at ${url}: ${summary}`);
    this.name = 'ContractViolationError';
  }
}
