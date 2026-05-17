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

const providerMetadata = LLM_PROVIDERS.find((provider) => provider.id === LLM_PROVIDER_IDS.chatgpt)!;
const providerLabel = providerMetadata.label;
const defaultModel = providerMetadata.defaultModel;

export class ChatGPTProvider extends LLMProvider {
  getName(): string {
    return providerLabel;
  }

  async analyzePipeline(pipelineContent: string, cicdType: string): Promise<LLMAnalysis> {
    const apiKey = this.config.apiKey;

    if (!apiKey) {
      throw new ConfigurationError(APP_COPY.errors.missingApiKey, { provider: LLM_PROVIDER_IDS.chatgpt });
    }

    const model = this.config.model || defaultModel;
    const temperature = this.config.temperature ?? LLM_DEFAULTS.temperature;
    const maxTokens = this.config.maxTokens ?? LLM_DEFAULTS.maxTokens;
    const { systemPrompt, userPrompt } = this.buildPromptParts(pipelineContent, cicdType);

    try {
      const response = await axios.post(
        LLM_ENDPOINTS.openaiChat,
        {
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature,
          max_tokens: maxTokens
        },
        {
          headers: {
            [HTTP_HEADERS.authorization]: `${apiKey}`,
            [HTTP_HEADERS.contentType]: HTTP_HEADER_VALUES.json
          },
          timeout: LLM_DEFAULTS.requestTimeoutMs
        }
      );

      const content = response.data?.choices?.[0]?.message?.content?.trim();

      if (!content) {
        throw new ExternalServiceError(APP_COPY.errors.openaiEmptyResponse, {
          provider: LLM_PROVIDER_IDS.chatgpt
        });
      }

      return this.parseLLMResponse(content);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.error?.message || error.message;
        throw new ExternalServiceError(
          `${APP_COPY.errors.openaiRequestFailed}${status ? ` (status ${status})` : ''}.`,
          {
            provider: LLM_PROVIDER_IDS.chatgpt,
            status,
            message,
            isTimeout: error.code === 'ECONNABORTED'
          }
        );
      }

      throw new ExternalServiceError(APP_COPY.errors.openaiUnexpected, {
        provider: LLM_PROVIDER_IDS.chatgpt,
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }
}
