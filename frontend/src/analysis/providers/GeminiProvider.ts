import axios from 'axios';
import { APP_COPY } from '../../config/appCopy';
import {
  HTTP_HEADER_VALUES,
  HTTP_HEADERS,
  LLM_DEFAULTS,
  LLM_ENDPOINTS,
  LLM_PROVIDER_IDS,
  LLM_PROVIDERS
} from '../../config/appConfig';
import type { LLMAnalysis } from '../../types';
import { ConfigurationError, ExternalServiceError } from '../../services/errors';
import { LLMProvider } from '../interfaces/LLMProvider';

const providerMetadata = LLM_PROVIDERS.find((provider) => provider.id === LLM_PROVIDER_IDS.gemini)!;
const providerLabel = providerMetadata.label;
const defaultModel = providerMetadata.defaultModel;

export class GeminiProvider extends LLMProvider {
  getName(): string {
    return providerLabel;
  }

  async analyzePipeline(pipelineContent: string, cicdType: string): Promise<LLMAnalysis> {
    const apiKey = this.config.apiKey;

    if (!apiKey) {
      throw new ConfigurationError(APP_COPY.errors.missingApiKey, { provider: LLM_PROVIDER_IDS.gemini });
    }

    const model = this.config.model || defaultModel;
    const temperature = this.config.temperature ?? LLM_DEFAULTS.temperature;
    const maxTokens = this.config.maxTokens ?? LLM_DEFAULTS.maxTokens;
    const { systemPrompt, userPrompt } = this.buildPromptParts(pipelineContent, cicdType);

    try {
      const response = await axios.post(
        `${LLM_ENDPOINTS.geminiModels}/${model}:generateContent?key=${apiKey}`,
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
          responseMimeType: HTTP_HEADER_VALUES.json
        },
        {
          headers: {
            [HTTP_HEADERS.contentType]: HTTP_HEADER_VALUES.json
          },
          timeout: LLM_DEFAULTS.requestTimeoutMs
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
        throw new ExternalServiceError(APP_COPY.errors.geminiEmptyResponse, {
          provider: LLM_PROVIDER_IDS.gemini
        });
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
          `${APP_COPY.errors.geminiRequestFailed}${status ? ` (status ${status})` : ''}.`,
          {
            provider: LLM_PROVIDER_IDS.gemini,
            status,
            message,
            isTimeout: error.code === 'ECONNABORTED'
          }
        );
      }

      throw new ExternalServiceError(APP_COPY.errors.geminiUnexpected, {
        provider: LLM_PROVIDER_IDS.gemini,
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }
}
