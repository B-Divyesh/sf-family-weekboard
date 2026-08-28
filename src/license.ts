const PRODUCT = 'family-weekboard';
const API_BASE = 'https://api.sociobot.in/api/v1';
const LICENSE_KEY = `sb_license:${PRODUCT}`;
const VERDICT_KEY = `sb_license_verdict:${PRODUCT}`;

interface Verdict { valid: boolean; checkedAt: number }

export function captureLicenseFromUrl(): void {
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (!token) return;
  localStorage.setItem(LICENSE_KEY, token);
  localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: true, checkedAt: 0 }));
  url.searchParams.delete('license');
  history.replaceState({}, '', url);
}

export function getLicense(): string { return localStorage.getItem(LICENSE_KEY) ?? ''; }

export function getCachedUnlock(): boolean {
  if (!getLicense()) return false;
  try { return (JSON.parse(localStorage.getItem(VERDICT_KEY) ?? '') as Verdict).valid; } catch { return false; }
}

export function saveLicense(token: string): void {
  localStorage.setItem(LICENSE_KEY, token.trim());
  localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: true, checkedAt: 0 }));
}

export async function verifyLicense(force = false): Promise<boolean> {
  const token = getLicense();
  if (!token) return false;
  let cached: Verdict | null = null;
  try { cached = JSON.parse(localStorage.getItem(VERDICT_KEY) ?? 'null') as Verdict | null; } catch { /* ignored */ }
  if (!force && cached && Date.now() - cached.checkedAt < 86_400_000) return cached.valid;
  try {
    const response = await fetch(`${API_BASE}/products/${PRODUCT}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('verify unavailable');
    const result = await response.json() as { valid: boolean };
    localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: result.valid, checkedAt: Date.now() }));
    return result.valid;
  } catch {
    return cached?.valid ?? true;
  }
}

export const CHECKOUT_URL = `${API_BASE}/products/${PRODUCT}/checkout`;
