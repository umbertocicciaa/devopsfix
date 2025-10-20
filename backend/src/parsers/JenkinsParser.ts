import { CICDParser, ParsedPipeline } from '../interfaces/CICDParser';

export class JenkinsParser extends CICDParser {
  getName(): string {
    return 'Jenkins';
  }

  parse(content: string): ParsedPipeline {
    try {
      // Simple Jenkinsfile parsing - looking for pipeline structure
      const stages: string[] = [];
      const jobs: any[] = [];
      
      // Extract stage names using regex
      const stageMatches = content.matchAll(/stage\(['"](.+?)['"]\)/g);
      for (const match of stageMatches) {
        stages.push(match[1]);
      }
      
      // Extract steps
      const stepsMatches = content.matchAll(/stage\(['"](.+?)['"]\)\s*\{([^}]+)\}/gs);
      for (const match of stepsMatches) {
        jobs.push({
          name: match[1],
          content: match[2].trim()
        });
      }
      
      return {
        type: 'Jenkins',
        stages,
        jobs,
        issues: this.validate(content).errors
      };
    } catch (error) {
      return {
        type: 'Jenkins',
        stages: [],
        jobs: [],
        issues: [`Failed to parse: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  validate(content: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!content.includes('pipeline')) {
      errors.push('Missing required "pipeline" block');
    }
    
    if (!content.includes('agent')) {
      errors.push('Missing required "agent" directive');
    }
    
    if (!content.includes('stages')) {
      errors.push('Missing required "stages" block');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}
