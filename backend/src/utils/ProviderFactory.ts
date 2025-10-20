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
    // Sanitize input to prevent any injection attempts
    const sanitizedName = name.toLowerCase().trim();
    
    // Validate that the provider name only contains safe characters
    if (!/^[a-z0-9-]+$/.test(sanitizedName)) {
      throw new Error(`Invalid provider name format: ${name}`);
    }
    
    const ProviderClass = this.providers.get(sanitizedName);
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
