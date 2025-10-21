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

  /**
   * Builds a consistent system/user prompt pair to guide LLMs.
   * Subclasses can extend/override if they need provider-specific tuning.
   */
  protected buildPromptParts(
    pipelineContent: string,
    cicdType: string
  ): { systemPrompt: string; userPrompt: string } {
    const systemPrompt = [
      'You are a senior DevOps engineer who reviews CI/CD pipelines.',
      'Respond with clear, actionable guidance that prioritizes reliability, security, and performance.',
      'Always return a single JSON object with the following shape:',
      '{ "analysis": string, "suggestions": string[ ], "fixes": string }.',
      'Keep suggestions concise and focused on highest-impact improvements.',
      'If information is missing, explain what is needed instead of guessing.',
      'Do not include Markdown, code fences, or additional commentary outside the JSON object.'
    ].join(' ');

    const userPrompt = [
      `CI/CD platform: ${cicdType}`,
      'Task: Analyze the pipeline configuration. Highlight risks, gaps, and best-practice deviations.',
      'Return prioritized suggestions (at least three when possible) and summarize the most critical fixes.',
      'Pipeline configuration:',
      pipelineContent
    ].join('\n\n');

    return { systemPrompt, userPrompt };
  }

  protected parseLLMResponse(rawText: string): LLMResponse {
    const trimmed = (rawText || '').trim();

    if (!trimmed) {
      return {
        analysis: 'The LLM returned an empty response.',
        suggestions: [],
        fixes: 'No fixes provided.'
      };
    }

    const parsed = tryParseJsonObject(trimmed);

    if (parsed && typeof parsed === 'object') {
      const analysis =
        typeof parsed.analysis === 'string' && parsed.analysis.trim()
          ? parsed.analysis.trim()
          : trimmed;

      const suggestions = normalizeSuggestions(parsed.suggestions);

      const fixes =
        typeof parsed.fixes === 'string' && parsed.fixes.trim()
          ? parsed.fixes.trim()
          : analysis;

      return {
        analysis,
        suggestions,
        fixes
      };
    }

    return {
      analysis: trimmed,
      suggestions: [],
      fixes: 'Refer to the analysis for remediation guidance.'
    };
  }

  abstract getName(): string;
  abstract analyzePipeline(pipelineContent: string, cicdType: string): Promise<LLMResponse>;
}

function tryParseJsonObject(text: string): Record<string, unknown> | null {
  const candidates: string[] = [];
  const cleaned = text.trim();

  if (!cleaned) {
    return null;
  }

  if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
    candidates.push(cleaned);
  }

  for (const match of cleaned.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)) {
    const candidate = match[1]?.trim();
    if (candidate) {
      candidates.push(candidate);
    }
  }

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = cleaned.slice(firstBrace, lastBrace + 1).trim();
    if (candidate) {
      candidates.push(candidate);
    }
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      continue;
    }
  }

  return null;
}

function normalizeSuggestions(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (typeof entry === 'string') {
          return entry.trim();
        }
        try {
          return JSON.stringify(entry);
        } catch {
          return '';
        }
      })
      .filter((entry) => entry.length > 0);
  }

  if (typeof value === 'string' && value.trim()) {
    return value
      .split(/\r?\n+/)
      .map((line) => line.replace(/^[\-\*\d\.\)\s]+/, '').trim())
      .filter((line) => line.length > 0);
  }

  return [];
}
