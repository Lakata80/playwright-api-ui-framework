/**
 * Converts a plain object to a FormData instance.
 * All values are coerced to strings via String(). Undefined and null values are skipped.
 *
 * Used by API services that POST/PUT/DELETE with application/x-www-form-urlencoded bodies
 * on automationexercise.com.
 */
export function objectToFormData(data: Record<string, unknown>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      fd.append(key, String(value));
    }
  }
  return fd;
}
