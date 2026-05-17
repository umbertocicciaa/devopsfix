import type { CICDTypeId, InputMode, LLMProviderId } from '../config/appConfig';

export interface LLMProviderConfig {
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AnalysisRequest {
  pipelineContent?: string;
  repositoryUrl?: string;
  cicdType?: CICDTypeId;
  llmProvider: LLMProviderId;
  inputMode: InputMode;
  config?: LLMProviderConfig;
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
  improvedPipeline?: string;
}

export interface AnalysisResponse {
  success: boolean;
  parsed: ParsedPipeline;
  validation: Validation;
  analysis: LLMAnalysis;
  provider: string;
  originalPipeline: string;
  detectedCICDType?: CICDTypeId;
}
