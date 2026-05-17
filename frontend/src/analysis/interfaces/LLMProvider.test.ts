import { APP_COPY } from '../../config/appCopy';
import type { LLMAnalysis } from '../../types';
import { LLMProvider } from './LLMProvider';

class TestProvider extends LLMProvider {
  getName(): string {
    return 'Test';
  }

  async analyzePipeline(pipelineContent: string, _cicdType: string): Promise<LLMAnalysis> {
    return this.parseLLMResponse(pipelineContent);
  }
}

describe('LLMProvider', () => {
  it('parses JSON responses', async () => {
    const provider = new TestProvider({});
    const response = await provider.analyzePipeline(
      JSON.stringify({
        analysis: 'Analysis',
        suggestions: ['One', 'Two'],
        fixes: 'Fixes',
        improvedPipeline: 'Pipeline'
      }),
      'github-actions'
    );

    expect(response.analysis).toBe('Analysis');
    expect(response.suggestions).toEqual(['One', 'Two']);
    expect(response.fixes).toBe('Fixes');
    expect(response.improvedPipeline).toBe('Pipeline');
  });

  it('falls back to raw text responses', async () => {
    const provider = new TestProvider({});
    const response = await provider.analyzePipeline('Plain response', 'github-actions');

    expect(response.analysis).toBe('Plain response');
    expect(response.suggestions).toEqual([]);
    expect(response.fixes).toBe(APP_COPY.errors.llmFallbackFixes);
  });

  it('handles empty responses', async () => {
    const provider = new TestProvider({});
    const response = await provider.analyzePipeline('', 'github-actions');

    expect(response.analysis).toBe(APP_COPY.errors.llmEmptyResponse);
    expect(response.suggestions).toEqual([]);
    expect(response.fixes).toBe(APP_COPY.errors.llmNoFixes);
  });
});
