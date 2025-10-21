import axios from 'axios';
import { LLMProvider, LLMProviderConfig, LLMResponse } from '../interfaces/LLMProvider';

export class ChatGPTProvider extends LLMProvider {
  constructor(config: LLMProviderConfig) {
    super(config);
  }

  getName(): string {
    return 'ChatGPT';
  }

  async analyzePipeline(pipelineContent: string, cicdType: string): Promise<LLMResponse> {
    const apiKey = this.config.apiKey || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OpenAI API key is required. Provide config.apiKey or set OPENAI_API_KEY.');
    }

    const model = this.config.model || 'gpt-4o-mini';
    const temperature = this.config.temperature ?? 0.2;
    const maxTokens = this.config.maxTokens ?? 900;
    const { systemPrompt, userPrompt } = this.buildPromptParts(pipelineContent, cicdType);

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
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
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const content = response.data?.choices?.[0]?.message?.content?.trim();

      if (!content) {
        throw new Error('OpenAI API returned an empty response.');
      }

      return this.parseLLMResponse(content);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.error?.message || error.message;
        throw new Error(`OpenAI API request failed${status ? ` (status ${status})` : ''}: ${message}`);
      }

      throw error;
    }
  }
}
