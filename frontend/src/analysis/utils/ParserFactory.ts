import { APP_COPY } from '../../config/appCopy';
import { CICD_TYPE_IDS } from '../../config/appConfig';
import { BadRequestError } from '../../services/errors';
import type { CICDTypeId } from '../../config/appConfig';
import { CICDParser } from '../interfaces/CICDParser';
import { GitHubActionsParser } from '../parsers/GitHubActionsParser';
import { GitLabCIParser } from '../parsers/GitLabCIParser';
import { JenkinsParser } from '../parsers/JenkinsParser';

const parsers: Map<CICDTypeId, new () => CICDParser> = new Map([
  [CICD_TYPE_IDS.githubActions, GitHubActionsParser],
  [CICD_TYPE_IDS.gitlabCi, GitLabCIParser],
  [CICD_TYPE_IDS.jenkins, JenkinsParser]
]);

export class ParserFactory {
  static getParser(name: string): CICDParser {
    const sanitizedName = name.toLowerCase().trim();

    if (!/^[a-z0-9-]+$/.test(sanitizedName)) {
      throw new BadRequestError(APP_COPY.errors.invalidCicdTypeFormat, { provided: name });
    }

    const parserClass = parsers.get(sanitizedName as CICDTypeId);
    if (!parserClass) {
      throw new BadRequestError(APP_COPY.errors.unknownCicdType, {
        provided: name,
        available: Array.from(parsers.keys())
      });
    }

    return new parserClass();
  }

  static registerParser(name: CICDTypeId, parserClass: new () => CICDParser): void {
    parsers.set(name, parserClass);
  }

  static getAvailableParsers(): CICDTypeId[] {
    return Array.from(parsers.keys());
  }
}
