import axios from 'axios';
import { LLMProvider, LLMProviderConfig, LLMResponse } from '../interfaces/LLMProvider';
import { ConfigurationError, ExternalServiceError } from '../utils/AppError';

export class GeminiProvider extends LLMProvider {
  constructor(config: LLMProviderConfig) {
    super(config);
  }

  getName(): string {
    return 'Gemini';
  }

  async analyzePipeline(pipelineContent: string, cicdType: string): Promise<LLMResponse> {
    const apiKey = this.config.apiKey || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      throw new ConfigurationError('Google Gemini API key is required. Provide config.apiKey or set GOOGLE_API_KEY.', {
        provider: 'gemini',
        environmentVariable: 'GOOGLE_API_KEY'
      });
    }

    const model = this.config.model || 'gemini-1.5-flash';
    const temperature = this.config.temperature ?? 0.2;
    const maxTokens = this.config.maxTokens ?? 900;
    const { systemPrompt, userPrompt } = this.buildPromptParts(pipelineContent, cicdType);

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `${systemPrompt}\n\n${userPrompt}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens
          },
          responseMimeType: 'application/json'
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const candidate = response.data?.candidates?.[0];

      const collectParts = (): Array<{ text?: string }> => {
        if (!candidate) {
          return [];
        }

        if (Array.isArray(candidate.content)) {
          return candidate.content.flatMap((item: { parts?: Array<{ text?: string }> }) =>
            Array.isArray(item?.parts) ? item.parts : []
          );
        }

        if (Array.isArray(candidate?.content?.parts)) {
          return candidate.content.parts;
        }

        return [];
      };

      const content = collectParts()
        .map((part) => (typeof part.text === 'string' ? part.text : ''))
        .join('')
        .trim();

      if (!content) {
        throw new ExternalServiceError('Gemini API returned an empty response.', { provider: 'gemini' });
      }

      return this.parseLLMResponse(content);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message =
          error.response?.data?.error?.message ||
          error.response?.data?.error ||
          error.message;
        throw new ExternalServiceError(
          `Gemini API request failed${status ? ` (status ${status})` : ''}.`,
          {
            provider: 'gemini',
            status,
            message,
            isTimeout: error.code === 'ECONNABORTED'
          }
        );
      }

      throw new ExternalServiceError('Unexpected error while communicating with Gemini.', {
        provider: 'gemini',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }
}
