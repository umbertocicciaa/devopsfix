import { Router, Request, Response } from 'express';
import { ParserFactory } from '../utils/ParserFactory';
import { ProviderFactory } from '../utils/ProviderFactory';
import { RepositoryFetcher } from '../utils/RepositoryFetcher';

const router = Router();

router.post('/analyze', async (req: Request, res: Response) => {
  try {
    let { pipelineContent, cicdType, llmProvider, config, repositoryUrl } = req.body;

    // If repository URL is provided, fetch the content
    if (repositoryUrl) {
      try {
        const { content, detectedCICDType } = await RepositoryFetcher.fetchPipeline(repositoryUrl);
        pipelineContent = content;
        
        // Auto-detect CI/CD type if not provided
        if (!cicdType && detectedCICDType) {
          cicdType = detectedCICDType;
        }
      } catch (fetchError) {
        return res.status(400).json({
          error: fetchError instanceof Error ? fetchError.message : 'Failed to fetch pipeline from repository'
        });
      }
    }

    if (!pipelineContent || !cicdType || !llmProvider) {
      return res.status(400).json({
        error: 'Missing required fields: pipelineContent (or repositoryUrl), cicdType, and llmProvider are required'
      });
    }

    // Parse the pipeline
    const parser = ParserFactory.getParser(cicdType);
    const parsedPipeline = parser.parse(pipelineContent);
    const validation = parser.validate(pipelineContent);

    // Analyze with LLM
    const provider = ProviderFactory.getProvider(llmProvider, config || {});
    const analysis = await provider.analyzePipeline(pipelineContent, cicdType);

    return res.json({
      success: true,
      parsed: parsedPipeline,
      validation,
      analysis,
      provider: provider.getName(),
      detectedCICDType: repositoryUrl ? cicdType : undefined
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
});

router.get('/providers', (req: Request, res: Response) => {
  const providers = ProviderFactory.getAvailableProviders();
  res.json({ providers });
});

router.get('/cicd-types', (req: Request, res: Response) => {
  const cicdTypes = ParserFactory.getAvailableParsers();
  res.json({ cicdTypes });
});

export default router;
