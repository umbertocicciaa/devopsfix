export interface LLMProviderConfig {
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  suggestions: string[];
  analysis: string;
  fixes: string;
}

export abstract class LLMProvider {
  protected config: LLMProviderConfig;

  constructor(config: LLMProviderConfig) {
    this.config = config;
  }

  abstract getName(): string;
  abstract analyzePipeline(pipelineContent: string, cicdType: string): Promise<LLMResponse>;
}
