import { APP_COPY } from '../../config/appCopy';
import type { LLMAnalysis, LLMProviderConfig } from '../../types';

export abstract class LLMProvider {
  protected config: LLMProviderConfig;

  constructor(config: LLMProviderConfig) {
    this.config = config;
  }

  protected buildPromptParts(
    pipelineContent: string,
    cicdType: string
  ): { systemPrompt: string; userPrompt: string } {
    const systemPrompt = APP_COPY.prompts.systemLines.join(' ');
    const userPrompt = [
      `${APP_COPY.prompts.userLines[0]} ${cicdType}`,
      ...APP_COPY.prompts.userLines.slice(1),
      pipelineContent
    ].join('\n\n');

    return { systemPrompt, userPrompt };
  }

  protected parseLLMResponse(rawText: string): LLMAnalysis {
    const trimmed = (rawText || '').trim();

    if (!trimmed) {
      return {
        analysis: APP_COPY.errors.llmEmptyResponse,
        suggestions: [],
        fixes: APP_COPY.errors.llmNoFixes
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

      const improvedPipeline =
        typeof parsed.improvedPipeline === 'string' && parsed.improvedPipeline.trim()
          ? parsed.improvedPipeline.trim()
          : undefined;

      return {
        analysis,
        suggestions,
        fixes,
        improvedPipeline
      };
    }

    return {
      analysis: trimmed,
      suggestions: [],
      fixes: APP_COPY.errors.llmFallbackFixes
    };
  }

  abstract getName(): string;
  abstract analyzePipeline(pipelineContent: string, cicdType: string): Promise<LLMAnalysis>;
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
