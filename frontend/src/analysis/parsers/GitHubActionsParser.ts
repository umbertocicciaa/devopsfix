import * as yaml from 'js-yaml';
import { APP_COPY } from '../../config/appCopy';
import { CICD_TYPE_IDS, CICD_TYPES } from '../../config/appConfig';
import type { ParsedPipeline } from '../../types';
import { CICDParser } from '../interfaces/CICDParser';
import { formatTemplate } from '../utils/textFormat';

const typeLabel =
  CICD_TYPES.find((type) => type.id === CICD_TYPE_IDS.githubActions)?.label ?? CICD_TYPE_IDS.githubActions;

export class GitHubActionsParser extends CICDParser {
  getName(): string {
    return typeLabel;
  }

  parse(content: string): ParsedPipeline {
    try {
      const parsed: any = yaml.load(content);
      const jobs = parsed?.jobs || {};

      return {
        type: typeLabel,
        stages: Object.keys(jobs),
        jobs: Object.entries(jobs).map(([name, job]: [string, any]) => ({
          name,
          steps: job.steps || [],
          runsOn: job['runs-on']
        })),
        issues: this.validate(content).errors
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : APP_COPY.errors.unexpectedError;
      return {
        type: typeLabel,
        stages: [],
        jobs: [],
        issues: [formatTemplate(APP_COPY.validation.githubActions.parseFailed, { error: message })]
      };
    }
  }

  validate(content: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      const parsed: any = yaml.load(content);

      if (!parsed?.jobs) {
        errors.push(APP_COPY.validation.githubActions.missingJobs);
      }

      if (parsed?.jobs) {
        Object.entries(parsed.jobs).forEach(([jobName, job]: [string, any]) => {
          if (!job['runs-on']) {
            errors.push(
              formatTemplate(APP_COPY.validation.githubActions.missingRunsOn, { jobName })
            );
          }
        });
      }

      return {
        valid: errors.length === 0,
        errors
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : APP_COPY.errors.unexpectedError;
      return {
        valid: false,
        errors: [formatTemplate(APP_COPY.validation.githubActions.invalidYaml, { error: message })]
      };
    }
  }
}
