import { CICDParser } from '../interfaces/CICDParser';
import { GitHubActionsParser } from '../parsers/GitHubActionsParser';
import { GitLabCIParser } from '../parsers/GitLabCIParser';
import { JenkinsParser } from '../parsers/JenkinsParser';
import { BadRequestError } from './AppError';

export class ParserFactory {
  private static parsers: Map<string, new () => CICDParser> = new Map([
    ['github-actions', GitHubActionsParser],
    ['gitlab-ci', GitLabCIParser],
    ['jenkins', JenkinsParser]
  ]);

  static getParser(name: string): CICDParser {
    // Sanitize input to prevent any injection attempts
    const sanitizedName = name.toLowerCase().trim();
    
    // Validate that the parser name only contains safe characters
    if (!/^[a-z0-9-]+$/.test(sanitizedName)) {
      throw new BadRequestError('Invalid CI/CD type format.', { provided: name });
    }
    
    const ParserClass = this.parsers.get(sanitizedName);
    if (!ParserClass) {
      throw new BadRequestError('Unknown CI/CD type.', {
        provided: name,
        available: Array.from(this.parsers.keys())
      });
    }
    return new ParserClass();
  }

  static registerParser(name: string, parserClass: new () => CICDParser): void {
    this.parsers.set(name.toLowerCase(), parserClass);
  }

  static getAvailableParsers(): string[] {
    return Array.from(this.parsers.keys());
  }
}
