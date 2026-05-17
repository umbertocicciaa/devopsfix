import axios from 'axios';
import { APP_COPY } from '../../config/appCopy';
import {
  API_VERSIONS,
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

const providerMetadata = LLM_PROVIDERS.find((provider) => provider.id === LLM_PROVIDER_IDS.claude)!;
const providerLabel = providerMetadata.label;
const defaultModel = providerMetadata.defaultModel;

export class ClaudeProvider extends LLMProvider {
  getName(): string {
    return providerLabel;
  }

  async analyzePipeline(pipelineContent: string, cicdType: string): Promise<LLMAnalysis> {
    const apiKey = this.config.apiKey;

    if (!apiKey) {
      throw new ConfigurationError(APP_COPY.errors.missingApiKey, { provider: LLM_PROVIDER_IDS.claude });
    }

    const model = this.config.model || defaultModel;
    const temperature = this.config.temperature ?? LLM_DEFAULTS.temperature;
    const maxTokens = this.config.maxTokens ?? LLM_DEFAULTS.maxTokens;
    const { systemPrompt, userPrompt } = this.buildPromptParts(pipelineContent, cicdType);

    try {
      const response = await axios.post(
        LLM_ENDPOINTS.anthropicMessages,
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
            [HTTP_HEADERS.contentType]: HTTP_HEADER_VALUES.json,
            [HTTP_HEADERS.apiKey]: apiKey,
            [HTTP_HEADERS.anthropicVersion]: API_VERSIONS.anthropic
          },
          timeout: LLM_DEFAULTS.requestTimeoutMs
        }
      );

      const content = response.data?.content?.[0]?.text?.trim();

      if (!content) {
        throw new ExternalServiceError(APP_COPY.errors.claudeEmptyResponse, {
          provider: LLM_PROVIDER_IDS.claude
        });
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
          `${APP_COPY.errors.claudeRequestFailed}${status ? ` (status ${status})` : ''}.`,
          {
            provider: LLM_PROVIDER_IDS.claude,
            status,
            message: details,
            isTimeout: error.code === 'ECONNABORTED'
          }
        );
      }

      throw new ExternalServiceError(APP_COPY.errors.claudeUnexpected, {
        provider: LLM_PROVIDER_IDS.claude,
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }
}
