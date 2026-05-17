import { APP_COPY } from '../../config/appCopy';
import { LLM_PROVIDER_IDS } from '../../config/appConfig';
import { BadRequestError } from '../../services/errors';
import type { LLMProviderConfig } from '../../types';
import type { LLMProviderId } from '../../config/appConfig';
import { LLMProvider } from '../interfaces/LLMProvider';
import { ChatGPTProvider } from '../providers/ChatGPTProvider';
import { ClaudeProvider } from '../providers/ClaudeProvider';
import { GeminiProvider } from '../providers/GeminiProvider';

const providers: Map<LLMProviderId, new (config: LLMProviderConfig) => LLMProvider> = new Map([
  [LLM_PROVIDER_IDS.chatgpt, ChatGPTProvider],
  [LLM_PROVIDER_IDS.claude, ClaudeProvider],
  [LLM_PROVIDER_IDS.gemini, GeminiProvider]
]);

export class ProviderFactory {
  static getProvider(name: string, config: LLMProviderConfig): LLMProvider {
    const sanitizedName = name.toLowerCase().trim();

    if (!/^[a-z0-9-]+$/.test(sanitizedName)) {
      throw new BadRequestError(APP_COPY.errors.invalidProviderFormat, { provided: name });
    }

    const providerClass = providers.get(sanitizedName as LLMProviderId);
    if (!providerClass) {
      throw new BadRequestError(APP_COPY.errors.unknownProvider, {
        provided: name,
        available: Array.from(providers.keys())
      });
    }

    return new providerClass(config);
  }

  static registerProvider(name: LLMProviderId, providerClass: new (config: LLMProviderConfig) => LLMProvider): void {
    providers.set(name, providerClass);
  }

  static getAvailableProviders(): LLMProviderId[] {
    return Array.from(providers.keys());
  }
}
