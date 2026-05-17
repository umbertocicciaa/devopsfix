import { APP_COPY } from '../config/appCopy';
import { ANALYSIS_FIELDS, INPUT_MODES, type CICDTypeId } from '../config/appConfig';
import type { AnalysisRequest, AnalysisResponse } from '../types';
import { ParserFactory } from '../analysis/utils/ParserFactory';
import { ProviderFactory } from '../analysis/utils/ProviderFactory';
import { RepositoryFetcher } from '../analysis/utils/RepositoryFetcher';
import { ValidationError } from './errors';

export const analyzePipeline = async (request: AnalysisRequest): Promise<AnalysisResponse> => {
  const { pipelineContent, repositoryUrl, cicdType, llmProvider, config, inputMode } = request;

  const trimmedPipeline = (pipelineContent ?? '').trim();
  const trimmedRepositoryUrl = (repositoryUrl ?? '').trim();
  const usingRepository = inputMode === INPUT_MODES.repository;
  const usingManualInput = inputMode === INPUT_MODES.manual;

  if (usingManualInput && !trimmedPipeline) {
    throw new ValidationError(APP_COPY.errors.missingPipeline, { missing: [ANALYSIS_FIELDS.pipelineContent] });
  }

  if (usingRepository && !trimmedRepositoryUrl) {
    throw new ValidationError(APP_COPY.errors.missingRepository, { missing: [ANALYSIS_FIELDS.repositoryUrl] });
  }

  if (!usingRepository && !usingManualInput) {
    throw new ValidationError(APP_COPY.errors.missingInput, {
      missing: [ANALYSIS_FIELDS.pipelineContent, ANALYSIS_FIELDS.repositoryUrl]
    });
  }

  const normalizedConfig =
    config !== undefined && config !== null && typeof config === 'object' && !Array.isArray(config)
      ? {
          ...config,
          apiKey: config.apiKey?.trim()
        }
      : undefined;

  if (normalizedConfig === undefined && config !== undefined) {
    throw new ValidationError(APP_COPY.errors.invalidConfig);
  }

  let normalizedCicdType = cicdType?.trim();
  let normalizedPipelineContent = trimmedPipeline;

  if (usingRepository) {
    const { content, detectedCICDType } = await RepositoryFetcher.fetchPipeline(trimmedRepositoryUrl);
    normalizedPipelineContent = content;

    if (!normalizedCicdType && detectedCICDType) {
      normalizedCicdType = detectedCICDType;
    }
  }

  if (!normalizedPipelineContent || normalizedPipelineContent.trim().length === 0) {
    throw new ValidationError(APP_COPY.errors.missingPipelineContent);
  }

  if (!normalizedCicdType) {
    throw new ValidationError(APP_COPY.errors.missingCicdType);
  }

  if (!llmProvider) {
    throw new ValidationError(APP_COPY.errors.missingProvider);
  }

  const resolvedCicdType = normalizedCicdType as CICDTypeId;
  const parser = ParserFactory.getParser(resolvedCicdType);
  const parsedPipeline = parser.parse(normalizedPipelineContent);
  const validation = parser.validate(normalizedPipelineContent);

  const provider = ProviderFactory.getProvider(llmProvider, normalizedConfig || {});
  const analysis = await provider.analyzePipeline(normalizedPipelineContent, resolvedCicdType);

  const improvedPipeline =
    analysis.improvedPipeline && analysis.improvedPipeline.trim().length > 0
      ? analysis.improvedPipeline
      : normalizedPipelineContent;

  return {
    success: true,
    parsed: parsedPipeline,
    validation,
    analysis: {
      ...analysis,
      improvedPipeline
    },
    provider: provider.getName(),
    originalPipeline: normalizedPipelineContent,
    detectedCICDType: usingRepository ? resolvedCicdType : undefined
  };
};
