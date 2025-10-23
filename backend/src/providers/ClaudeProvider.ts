import axios from 'axios';
import { LLMProvider, LLMProviderConfig, LLMResponse } from '../interfaces/LLMProvider';
import { ConfigurationError, ExternalServiceError } from '../utils/AppError';

export class ClaudeProvider extends LLMProvider {
  constructor(config: LLMProviderConfig) {
    super(config);
  }

  getName(): string {
    return 'Claude';
  }

  async analyzePipeline(pipelineContent: string, cicdType: string): Promise<LLMResponse> {
    const apiKey = this.config.apiKey || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new ConfigurationError('Anthropic API key is required. Provide config.apiKey or set ANTHROPIC_API_KEY.', {
        provider: 'anthropic',
        environmentVariable: 'ANTHROPIC_API_KEY'
      });
    }

    const model = this.config.model || 'claude-3-sonnet-20240229';
    const temperature = this.config.temperature ?? 0.2;
    const maxTokens = this.config.maxTokens ?? 900;
    const { systemPrompt, userPrompt } = this.buildPromptParts(pipelineContent, cicdType);

    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model,
          max_tokens: maxTokens,
          temperature,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: userPrompt
                }
              ]
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          timeout: 30000
        }
      );

      const content = response.data?.content?.[0]?.text?.trim();

      if (!content) {
        throw new ExternalServiceError('Claude API returned an empty response.', { provider: 'anthropic' });
      }

      return this.parseLLMResponse(content);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const details =
          typeof error.response?.data === 'string'
            ? error.response.data
            : error.response?.data?.error?.message || error.message;
        throw new ExternalServiceError(
          `Anthropic API request failed${status ? ` (status ${status})` : ''}.`,
          {
            provider: 'anthropic',
            status,
            message: details,
            isTimeout: error.code === 'ECONNABORTED'
          }
        );
      }

      throw new ExternalServiceError('Unexpected error while communicating with Anthropic.', {
        provider: 'anthropic',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }
}
