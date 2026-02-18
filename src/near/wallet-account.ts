const STORAGE_KEY = "hot:near-account";

export function getAccountId(): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.accountId || null;
  } catch {
    return null;
  }
}

export function saveAccountId(accountId: string): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ accountId }));
}

export function clearAccountId(): void {
  localStorage.removeItem(STORAGE_KEY);
}
