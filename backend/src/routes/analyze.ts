import { Router, Request, Response } from 'express';
import { ParserFactory } from '../utils/ParserFactory';
import { ProviderFactory } from '../utils/ProviderFactory';

const router = Router();

router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { pipelineContent, cicdType, llmProvider, config } = req.body;

    if (!pipelineContent || !cicdType || !llmProvider) {
      return res.status(400).json({
        error: 'Missing required fields: pipelineContent, cicdType, and llmProvider are required'
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
      provider: provider.getName()
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
