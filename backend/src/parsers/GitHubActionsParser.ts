import { CICDParser, ParsedPipeline } from '../interfaces/CICDParser';
import * as yaml from 'js-yaml';

export class GitHubActionsParser extends CICDParser {
  getName(): string {
    return 'GitHub Actions';
  }

  parse(content: string): ParsedPipeline {
    try {
      const parsed: any = yaml.load(content);
      const jobs = parsed.jobs || {};
      
      return {
        type: 'GitHub Actions',
        stages: Object.keys(jobs),
        jobs: Object.entries(jobs).map(([name, job]: [string, any]) => ({
          name,
          steps: job.steps || [],
          runsOn: job['runs-on']
        })),
        issues: this.validate(content).errors
      };
    } catch (error) {
      return {
        type: 'GitHub Actions',
        stages: [],
        jobs: [],
        issues: [`Failed to parse: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  validate(content: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    try {
      const parsed: any = yaml.load(content);
      
      if (!parsed.jobs) {
        errors.push('Missing required "jobs" section');
      }
      
      if (parsed.jobs) {
        Object.entries(parsed.jobs).forEach(([jobName, job]: [string, any]) => {
          if (!job['runs-on']) {
            errors.push(`Job "${jobName}" missing required "runs-on" field`);
          }
        });
      }
      
      return {
        valid: errors.length === 0,
        errors
      };
    } catch (error) {
      return {
        valid: false,
        errors: [`Invalid YAML: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }
}
