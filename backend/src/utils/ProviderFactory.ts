import { LLMProvider, LLMProviderConfig } from '../interfaces/LLMProvider';
import { ChatGPTProvider } from '../providers/ChatGPTProvider';
import { ClaudeProvider } from '../providers/ClaudeProvider';
import { GeminiProvider } from '../providers/GeminiProvider';

export class ProviderFactory {
  private static providers: Map<string, new (config: LLMProviderConfig) => LLMProvider> = new Map([
    ['chatgpt', ChatGPTProvider],
    ['claude', ClaudeProvider],
    ['gemini', GeminiProvider]
  ]);

  static getProvider(name: string, config: LLMProviderConfig): LLMProvider {
    const ProviderClass = this.providers.get(name.toLowerCase());
    if (!ProviderClass) {
      throw new Error(`Unknown provider: ${name}. Available providers: ${Array.from(this.providers.keys()).join(', ')}`);
    }
    return new ProviderClass(config);
  }

  static registerProvider(name: string, providerClass: new (config: LLMProviderConfig) => LLMProvider): void {
    this.providers.set(name.toLowerCase(), providerClass);
  }

  static getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}
