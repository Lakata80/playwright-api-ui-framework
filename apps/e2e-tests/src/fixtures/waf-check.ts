/**
 * Detects whether automationexercise.com is blocking this runner via WAF.
 *
 * Two independent WAF systems can block GitHub Actions datacenter IPs:
 *
 *  - Imunify360: blocks Node.js API requests — returns HTTP 200 with a JSON
 *    payload {"message":"Access denied by Imunify360 bot-protection."} instead
 *    of real API data. Detected by isWafBlocked().
 *
 *  - Cloudflare JS challenge: blocks headless Chromium on the login page — the
 *    browser gets into a redirect loop (navigated to /login → JS challenge →
 *    back to /login, ×4+) and the real login form never renders. Detected by
 *    isSiteBlocked() via a Node.js fetch of the login page HTML.
 *
 * Usage in test describe blocks:
 *
 *   // API / contract tests (only need the Imunify360 check):
 *   test.beforeAll(async () => {
 *     test.skip(await isWafBlocked(), WAF_SKIP_REASON);
 *   });
 *
 *   // UI / hybrid tests (need both Imunify360 + Cloudflare checks):
 *   test.beforeAll(async () => {
 *     test.skip(await isSiteBlocked(), SITE_SKIP_REASON);
 *   });
 *
 * When test.skip(true, reason) is called in beforeAll, Playwright marks every
 * test in the describe block as skipped — not failed — accurately reflecting
 * "target unreachable" rather than "code broken".
 */

export const WAF_SKIP_REASON =
  'automationexercise.com is blocked by Imunify360 WAF on this runner — ' +
  'tests cannot run until the datacenter IP reputation resets (~1 h). ' +
  'Not a code failure.';

export const SITE_SKIP_REASON =
  'automationexercise.com is unreachable on this runner (Cloudflare challenge ' +
  'loop on /login or Imunify360 blocking API) — tests cannot run until the ' +
  'datacenter IP reputation resets (~1 h). Not a code failure.';

const PROBE_HEADERS: HeadersInit = {
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  Origin: 'https://automationexercise.com',
  Referer: 'https://automationexercise.com/',
  'User-Agent':
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'sec-ch-ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Linux"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
};

/** Imunify360 check: API endpoint returns block JSON instead of real data. */
export async function isWafBlocked(): Promise<boolean> {
  if (!process.env['CI']) return false;
  try {
    const res = await fetch('https://automationexercise.com/api/productsList', {
      headers: PROBE_HEADERS,
    });
    const body = (await res.json()) as { message?: string };
    return typeof body.message === 'string' && body.message.includes('bot-protection');
  } catch {
    return false;
  }
}

/**
 * Cloudflare check: login page HTML is missing the real login form.
 *
 * When Cloudflare challenges the IP, the /login response is a JS challenge page
 * that does not contain the site's `data-qa` form attributes. A real browser would
 * execute the challenge script, but on flagged IPs it loops without resolving.
 */
async function isBrowserLoginBlocked(): Promise<boolean> {
  try {
    const res = await fetch('https://automationexercise.com/login', {
      headers: { ...PROBE_HEADERS, Accept: 'text/html,application/xhtml+xml,*/*' },
    });
    const html = await res.text();
    return !html.includes('data-qa="login-email"');
  } catch {
    return false;
  }
}

/** Combined check for UI / hybrid tests that need both API and browser access. */
export async function isSiteBlocked(): Promise<boolean> {
  if (!process.env['CI']) return false;
  return (await isWafBlocked()) || (await isBrowserLoginBlocked());
}
