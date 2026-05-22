import { STORAGE_KEYS, type LLMProviderId } from '../config/appConfig';

const inMemoryStore = new Map<string, string>();
const STORAGE_KEY_PREFIX = `${STORAGE_KEYS.apiKeyPrefix}.`;

export type StorageMode = 'memory' | 'session';

const buildStorageKey = (providerId: LLMProviderId): string =>
  `${STORAGE_KEYS.apiKeyPrefix}.${providerId}`;

const isStorageAvailable = (storage?: Storage): storage is Storage => {
  if (!storage) {
    return false;
  }

  try {
    const testKey = `${STORAGE_KEYS.apiKeyPrefix}.test`;
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

const isTrackedStorageKey = (key: string): boolean => key.startsWith(STORAGE_KEY_PREFIX);

const createMemoryStorage = (): Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> => ({
  getItem: (key: string) => inMemoryStore.get(key) ?? null,
  setItem: (key: string, value: string) => {
    inMemoryStore.set(key, value);
  },
  removeItem: (key: string) => {
    inMemoryStore.delete(key);
  }
});

const getSessionStorage = (): Storage | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  return isStorageAvailable(window.sessionStorage) ? window.sessionStorage : null;
};

const getSessionStorageKeys = (storage: Storage): string[] => {
  const keys: string[] = [];

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key && isTrackedStorageKey(key)) {
      keys.push(key);
    }
  }

  return keys;
};

const hasSessionStoredApiKeys = (): boolean => {
  const storage = getSessionStorage();

  return storage ? getSessionStorageKeys(storage).length > 0 : false;
};

export const hasStoredSessionApiKeys = (): boolean => hasSessionStoredApiKeys();

let currentStorageMode: StorageMode = hasSessionStoredApiKeys() ? 'session' : 'memory';

const migrateTrackedEntries = (
  source: Pick<Storage, 'getItem' | 'removeItem'>,
  target: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>,
  keys: string[]
): void => {
  keys.forEach((key) => {
    const value = source.getItem(key);

    if (value !== null) {
      target.setItem(key, value);
    }

    source.removeItem(key);
  });
};

const getActiveStorage = (): Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> => {
  if (currentStorageMode !== 'session') {
    return createMemoryStorage();
  }

  return getSessionStorage() ?? createMemoryStorage();
};

export const setStorageMode = (mode: StorageMode): void => {
  if (mode === currentStorageMode) {
    return;
  }

  const previousMode = currentStorageMode;
  currentStorageMode = mode;

  const sessionStorage = getSessionStorage();

  if (!sessionStorage) {
    return;
  }

  if (previousMode === 'memory' && mode === 'session') {
    migrateTrackedEntries(createMemoryStorage(), sessionStorage, Array.from(inMemoryStore.keys()).filter(isTrackedStorageKey));
    return;
  }

  if (previousMode === 'session' && mode === 'memory') {
    migrateTrackedEntries(sessionStorage, createMemoryStorage(), getSessionStorageKeys(sessionStorage));
  }
};

export const getStoredApiKey = (providerId: LLMProviderId): string => {
  return getActiveStorage().getItem(buildStorageKey(providerId)) ?? '';
};

export const setStoredApiKey = (providerId: LLMProviderId, value: string): void => {
  const trimmedValue = value.trim();
  const storage = getActiveStorage();

  if (!trimmedValue) {
    storage.removeItem(buildStorageKey(providerId));
    return;
  }

  storage.setItem(buildStorageKey(providerId), trimmedValue);
};

export const clearStoredApiKey = (providerId: LLMProviderId): void => {
  getActiveStorage().removeItem(buildStorageKey(providerId));
};
