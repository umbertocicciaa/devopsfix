import { CICDParser } from '../interfaces/CICDParser';
import { GitHubActionsParser } from '../parsers/GitHubActionsParser';
import { GitLabCIParser } from '../parsers/GitLabCIParser';
import { JenkinsParser } from '../parsers/JenkinsParser';

export class ParserFactory {
  private static parsers: Map<string, new () => CICDParser> = new Map([
    ['github-actions', GitHubActionsParser],
    ['gitlab-ci', GitLabCIParser],
    ['jenkins', JenkinsParser]
  ]);

  static getParser(name: string): CICDParser {
    const ParserClass = this.parsers.get(name.toLowerCase());
    if (!ParserClass) {
      throw new Error(`Unknown CI/CD type: ${name}. Available types: ${Array.from(this.parsers.keys()).join(', ')}`);
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
