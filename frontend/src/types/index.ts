export interface AnalysisRequest {
  pipelineContent?: string;
  repositoryUrl?: string;
  cicdType: string;
  llmProvider: string;
  config?: {
    apiKey?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
}

export interface ParsedPipeline {
  type: string;
  stages: string[];
  jobs: any[];
  issues: string[];
}

export interface Validation {
  valid: boolean;
  errors: string[];
}

export interface LLMAnalysis {
  suggestions: string[];
  analysis: string;
  fixes: string;
}

export interface AnalysisResponse {
  success: boolean;
  parsed: ParsedPipeline;
  validation: Validation;
  analysis: LLMAnalysis;
  provider: string;
  detectedCICDType?: string;
}
