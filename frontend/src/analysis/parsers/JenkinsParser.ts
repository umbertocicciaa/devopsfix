import { APP_COPY } from '../../config/appCopy';
import { CICD_TYPE_IDS, CICD_TYPES } from '../../config/appConfig';
import type { ParsedPipeline } from '../../types';
import { CICDParser } from '../interfaces/CICDParser';
import { formatTemplate } from '../utils/textFormat';

const typeLabel =
  CICD_TYPES.find((type) => type.id === CICD_TYPE_IDS.jenkins)?.label ?? CICD_TYPE_IDS.jenkins;

export class JenkinsParser extends CICDParser {
  getName(): string {
    return typeLabel;
  }

  parse(content: string): ParsedPipeline {
    try {
      const stages: string[] = [];
      const jobs: any[] = [];

      const stageMatches = content.matchAll(/stage\(['"](.+?)['"]\)/g);
      for (const match of stageMatches) {
        stages.push(match[1]);
      }

      const stepsMatches = content.matchAll(/stage\(['"](.+?)['"]\)\s*\{([^}]+)\}/gs);
      for (const match of stepsMatches) {
        jobs.push({
          name: match[1],
          content: match[2].trim()
        });
      }

      return {
        type: typeLabel,
        stages,
        jobs,
        issues: this.validate(content).errors
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : APP_COPY.errors.unexpectedError;
      return {
        type: typeLabel,
        stages: [],
        jobs: [],
        issues: [formatTemplate(APP_COPY.validation.jenkins.parseFailed, { error: message })]
      };
    }
  }

  validate(content: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!content.includes('pipeline')) {
      errors.push(APP_COPY.validation.jenkins.missingPipeline);
    }

    if (!content.includes('agent')) {
      errors.push(APP_COPY.validation.jenkins.missingAgent);
    }

    if (!content.includes('stages')) {
      errors.push(APP_COPY.validation.jenkins.missingStages);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
