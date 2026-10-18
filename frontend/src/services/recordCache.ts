const RECORD_CACHE_TTL_MS = 30_000;

type CacheEntry<T> = {
    expiresAt: number;
    value: T;
};

const records = new Map<string, CacheEntry<unknown>>();
const pendingRequests = new Map<string, Promise<unknown>>();
let cacheVersion = 0;

function scopedKey(key: string): string {
    // Keep protected data in memory only and separate it by the active token.
    return `${localStorage.getItem("token") || "anonymous"}:${key}`;
}

export async function getCachedRecord<T>(
    key: string,
    request: () => Promise<T>
): Promise<T> {
    const cacheKey = scopedKey(key);
    const cached = records.get(cacheKey) as CacheEntry<T> | undefined;

    if (cached && cached.expiresAt > Date.now()) {
        return cached.value;
    }

    if (cached) {
        records.delete(cacheKey);
    }

    const pending = pendingRequests.get(cacheKey) as Promise<T> | undefined;
    if (pending) {
        return pending;
    }

    const requestVersion = cacheVersion;
    const response = request()
        .then((value) => {
            if (requestVersion === cacheVersion) {
                records.set(cacheKey, {
                    value,
                    expiresAt: Date.now() + RECORD_CACHE_TTL_MS,
                });
            }
            return value;
        })
        .finally(() => {
            pendingRequests.delete(cacheKey);
        });

    pendingRequests.set(cacheKey, response);
    return response;
}

export function peekCachedRecord<T>(key: string): T | undefined {
    const cacheKey = scopedKey(key);
    const cached = records.get(cacheKey) as CacheEntry<T> | undefined;

    if (!cached || cached.expiresAt <= Date.now()) {
        if (cached) {
            records.delete(cacheKey);
        }
        return undefined;
    }

    return cached.value;
}

export function invalidateRecordCache(): void {
    cacheVersion += 1;
    records.clear();
    pendingRequests.clear();
}
