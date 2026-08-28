const PRODUCT = 'family-weekboard';
const API_BASE = 'https://api.sociobot.in/api/v1';
const LICENSE_KEY = `sb_license:${PRODUCT}`;
const VERDICT_KEY = `sb_license_verdict:${PRODUCT}`;

interface Verdict { valid: boolean; checkedAt: number; token: string }

function cachedVerdict(token: string): Verdict | null {
  try {
    const verdict = JSON.parse(localStorage.getItem(VERDICT_KEY) ?? 'null') as Verdict | null;
    return verdict?.token === token && verdict.checkedAt > 0 ? verdict : null;
  } catch { return null; }
}

export function captureLicenseFromUrl(): void {
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (!token) return;
  saveLicense(token);
  url.searchParams.delete('license');
  history.replaceState({}, '', url);
}

export function getLicense(): string { return localStorage.getItem(LICENSE_KEY) ?? ''; }

export function getCachedUnlock(): boolean {
  const token = getLicense();
  return token ? cachedVerdict(token)?.valid ?? false : false;
}

export function saveLicense(token: string): void {
  localStorage.setItem(LICENSE_KEY, token.trim());
  localStorage.removeItem(VERDICT_KEY);
}

export async function verifyLicense(force = false): Promise<boolean> {
  const token = getLicense();
  if (!token) return false;
  const cached = cachedVerdict(token);
  if (!force && cached && Date.now() - cached.checkedAt < 86_400_000) return cached.valid;
  try {
    const response = await fetch(`${API_BASE}/products/${PRODUCT}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('verify unavailable');
    const result = await response.json() as { valid: boolean };
    localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: result.valid, checkedAt: Date.now(), token }));
    return result.valid;
  } catch {
    return cached?.valid ?? false;
  }
}

export const CHECKOUT_URL = `${API_BASE}/products/${PRODUCT}/checkout`;
