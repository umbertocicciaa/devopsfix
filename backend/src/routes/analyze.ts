import { Router, Request, Response, NextFunction } from 'express';
import { ParserFactory } from '../utils/ParserFactory';
import { ProviderFactory } from '../utils/ProviderFactory';
import { RepositoryFetcher } from '../utils/RepositoryFetcher';
import { ValidationError } from '../utils/AppError';

const router = Router();

router.post('/analyze', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as Record<string, unknown>;

    let pipelineContent = typeof body.pipelineContent === 'string' ? body.pipelineContent : undefined;
    let cicdType = typeof body.cicdType === 'string' ? body.cicdType : undefined;
    let llmProvider = typeof body.llmProvider === 'string' ? body.llmProvider : undefined;
    const repositoryUrl = typeof body.repositoryUrl === 'string' ? body.repositoryUrl : undefined;
    const config = body.config;

    const trimmedPipeline = (pipelineContent ?? '').trim();
    const trimmedRepositoryUrl = (repositoryUrl ?? '').trim();
    const usingRepository = trimmedRepositoryUrl.length > 0;
    const usingManualInput = trimmedPipeline.length > 0;
    const normalizedConfig =
      config !== undefined && config !== null && typeof config === 'object' && !Array.isArray(config)
        ? (config as Record<string, unknown>)
        : undefined;

    if (!usingRepository && !usingManualInput) {
      throw new ValidationError(
        'Provide either pipelineContent or repositoryUrl to analyze a pipeline.',
        { missing: ['pipelineContent', 'repositoryUrl'] }
      );
    }

    if (normalizedConfig === undefined && config !== undefined) {
      throw new ValidationError('Config must be an object if provided.');
    }

    if (cicdType) {
      cicdType = cicdType.trim();
    }

    if (llmProvider) {
      llmProvider = llmProvider.trim();
    }

    // If repository URL is provided, fetch the content
    if (usingRepository) {
      const { content, detectedCICDType } = await RepositoryFetcher.fetchPipeline(trimmedRepositoryUrl);
      pipelineContent = content;

      // Auto-detect CI/CD type if not provided
      if (!cicdType && detectedCICDType) {
        cicdType = detectedCICDType;
      }
    }

    if (!pipelineContent || pipelineContent.trim().length === 0) {
      throw new ValidationError('Unable to determine pipeline content to analyze.');
    }

    if (!cicdType || cicdType.trim().length === 0) {
      throw new ValidationError('CI/CD type is required to analyze the pipeline.');
    }

    if (!llmProvider || llmProvider.trim().length === 0) {
      throw new ValidationError('LLM provider is required to perform the analysis.');
    }

    // Parse the pipeline
    const parser = ParserFactory.getParser(cicdType);
    const parsedPipeline = parser.parse(pipelineContent);
    const validation = parser.validate(pipelineContent);

    // Analyze with LLM
    const provider = ProviderFactory.getProvider(llmProvider, normalizedConfig || {});
    const analysis = await provider.analyzePipeline(pipelineContent, cicdType);

    const improvedPipeline =
      analysis.improvedPipeline && analysis.improvedPipeline.trim().length > 0
        ? analysis.improvedPipeline
        : pipelineContent;

    return res.json({
      success: true,
      parsed: parsedPipeline,
      validation,
      analysis: {
        ...analysis,
        improvedPipeline
      },
      provider: provider.getName(),
      originalPipeline: pipelineContent,
      detectedCICDType: usingRepository ? cicdType : undefined
    });
  } catch (error) {
    next(error);
  }
});

router.get('/providers', (req: Request, res: Response, next: NextFunction) => {
  try {
    const providers = ProviderFactory.getAvailableProviders();
    res.json({ providers });
  } catch (error) {
    next(error);
  }
});

router.get('/cicd-types', (req: Request, res: Response, next: NextFunction) => {
  try {
    const cicdTypes = ParserFactory.getAvailableParsers();
    res.json({ cicdTypes });
  } catch (error) {
    next(error);
  }
});

export default router;
