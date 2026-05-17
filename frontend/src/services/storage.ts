import { STORAGE_KEYS, type LLMProviderId } from '../config/appConfig';

const inMemoryStore = new Map<string, string>();

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

const resolveStorage = (): Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> => {
  if (isStorageAvailable(window.localStorage)) {
    return window.localStorage;
  }

  if (isStorageAvailable(window.sessionStorage)) {
    return window.sessionStorage;
  }

  return {
    getItem: (key: string) => inMemoryStore.get(key) ?? null,
    setItem: (key: string, value: string) => {
      inMemoryStore.set(key, value);
    },
    removeItem: (key: string) => {
      inMemoryStore.delete(key);
    }
  };
};

const storage = resolveStorage();

export const getStoredApiKey = (providerId: LLMProviderId): string => {
  return storage.getItem(buildStorageKey(providerId)) ?? '';
};

export const setStoredApiKey = (providerId: LLMProviderId, value: string): void => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    storage.removeItem(buildStorageKey(providerId));
    return;
  }

  storage.setItem(buildStorageKey(providerId), trimmedValue);
};

export const clearStoredApiKey = (providerId: LLMProviderId): void => {
  storage.removeItem(buildStorageKey(providerId));
};
