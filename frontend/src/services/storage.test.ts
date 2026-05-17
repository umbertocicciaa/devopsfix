import { LLM_PROVIDER_IDS } from '../config/appConfig';
import { clearStoredApiKey, getStoredApiKey, setStoredApiKey } from './storage';

describe('storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('stores and retrieves API keys', () => {
    setStoredApiKey(LLM_PROVIDER_IDS.chatgpt, '  test-key  ');
    expect(getStoredApiKey(LLM_PROVIDER_IDS.chatgpt)).toBe('test-key');
  });

  it('clears stored keys when value is empty', () => {
    setStoredApiKey(LLM_PROVIDER_IDS.claude, 'value');
    setStoredApiKey(LLM_PROVIDER_IDS.claude, '');
    expect(getStoredApiKey(LLM_PROVIDER_IDS.claude)).toBe('');
  });

  it('removes stored keys explicitly', () => {
    setStoredApiKey(LLM_PROVIDER_IDS.gemini, 'value');
    clearStoredApiKey(LLM_PROVIDER_IDS.gemini);
    expect(getStoredApiKey(LLM_PROVIDER_IDS.gemini)).toBe('');
  });
});
