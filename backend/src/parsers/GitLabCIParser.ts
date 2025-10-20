import { CICDParser, ParsedPipeline } from '../interfaces/CICDParser';
import * as yaml from 'js-yaml';

export class GitLabCIParser extends CICDParser {
  getName(): string {
    return 'GitLab CI';
  }

  parse(content: string): ParsedPipeline {
    try {
      const parsed: any = yaml.load(content);
      const stages = parsed.stages || [];
      const jobs: any[] = [];
      
      Object.entries(parsed).forEach(([key, value]: [string, any]) => {
        if (key !== 'stages' && typeof value === 'object' && value.script) {
          jobs.push({
            name: key,
            stage: value.stage,
            script: value.script
          });
        }
      });
      
      return {
        type: 'GitLab CI',
        stages,
        jobs,
        issues: this.validate(content).errors
      };
    } catch (error) {
      return {
        type: 'GitLab CI',
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
      
      Object.entries(parsed).forEach(([key, value]: [string, any]) => {
        if (key !== 'stages' && typeof value === 'object') {
          if (!value.script && !value.trigger && !value.include) {
            errors.push(`Job "${key}" missing required "script" field`);
          }
        }
      });
      
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
