/**
 * Detects whether automationexercise.com is blocking this runner via Imunify360 WAF.
 *
 * GitHub Actions datacenter IPs are occasionally flagged, causing all API responses to
 * return a JSON block page (HTTP 200 with {"message":"Access denied by Imunify360
 * bot-protection. IPs used for automation should be whitelisted"}) instead of real data.
 *
 * Usage in test describe blocks:
 *
 *   test.beforeAll(async () => {
 *     test.skip(await isWafBlocked(), WAF_SKIP_REASON);
 *   });
 *
 * When true, test.skip() in beforeAll marks every test in the describe block as skipped
 * (not failed), accurately reflecting that the target is unreachable, not broken.
 */

export const WAF_SKIP_REASON =
  'automationexercise.com is blocked by Imunify360 WAF on this runner — ' +
  'tests cannot run until the datacenter IP reputation resets (~1 h). ' +
  'Not a code failure.';

const PROBE_URL = 'https://automationexercise.com/api/productsList';

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

export async function isWafBlocked(): Promise<boolean> {
  if (!process.env['CI']) return false;
  try {
    const res = await fetch(PROBE_URL, { headers: PROBE_HEADERS });
    const body = (await res.json()) as { message?: string };
    return typeof body.message === 'string' && body.message.includes('bot-protection');
  } catch {
    return false;
  }
}
