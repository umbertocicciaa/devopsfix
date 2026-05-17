import * as yaml from 'js-yaml';
import { APP_COPY } from '../../config/appCopy';
import { CICD_TYPE_IDS, CICD_TYPES } from '../../config/appConfig';
import type { ParsedPipeline } from '../../types';
import { CICDParser } from '../interfaces/CICDParser';
import { formatTemplate } from '../utils/textFormat';

const typeLabel =
  CICD_TYPES.find((type) => type.id === CICD_TYPE_IDS.gitlabCi)?.label ?? CICD_TYPE_IDS.gitlabCi;

export class GitLabCIParser extends CICDParser {
  getName(): string {
    return typeLabel;
  }

  parse(content: string): ParsedPipeline {
    try {
      const parsed: any = yaml.load(content);
      const stages = parsed?.stages || [];
      const jobs: any[] = [];

      Object.entries(parsed || {}).forEach(([key, value]: [string, any]) => {
        if (key !== 'stages' && typeof value === 'object' && value?.script) {
          jobs.push({
            name: key,
            stage: value.stage,
            script: value.script
          });
        }
      });

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
        issues: [formatTemplate(APP_COPY.validation.gitlab.parseFailed, { error: message })]
      };
    }
  }

  validate(content: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      const parsed: any = yaml.load(content);

      Object.entries(parsed || {}).forEach(([key, value]: [string, any]) => {
        if (key !== 'stages' && typeof value === 'object') {
          if (!value.script && !value.trigger && !value.include) {
            errors.push(formatTemplate(APP_COPY.validation.gitlab.missingScript, { jobName: key }));
          }
        }
      });

      return {
        valid: errors.length === 0,
        errors
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : APP_COPY.errors.unexpectedError;
      return {
        valid: false,
        errors: [formatTemplate(APP_COPY.validation.gitlab.invalidYaml, { error: message })]
      };
    }
  }
}
